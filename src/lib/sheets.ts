import { Complaint } from '../types';
import { CATEGORIES_MAP, STATUS_MAP } from '../constants';
import { uploadPhotoToDrive } from './drive';

// Helper to extract Spreadsheet ID from any URL or return the raw string
export function parseSpreadsheetId(val: string): string {
  const trimmed = val.trim();
  // Regex to match google sheets URI format: .../spreadsheets/d/SPREADSHEET_ID/...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : trimmed;
}

// 1. Create a brand new Google Spreadsheet
export async function createGoogleSpreadsheet(token: string, titleSuffix: string = ''): Promise<{ id: string; url: string }> {
  const title = `Denúncias de Cidadãos — ${titleSuffix || 'Portal Leme'}`;
  
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
      sheets: [
        {
          properties: {
            title: 'Denúncias',
            gridProperties: {
              frozenRowCount: 1, // Freeze header row for look & feel
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Falha ao criar nova planilha');
  }

  const data = await res.json();
  return {
    id: data.spreadsheetId,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
  };
}

// 2. Clear any old data inside the "Denúncias" sheet
export async function clearSpreadsheetData(token: string, spreadsheetId: string): Promise<void> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('Denúncias!A:L')}:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.status === 401) {
    throw new Error('Sessão expirada. Reconecte sua conta do Google para continuar.');
  }

  if (!res.ok) {
    // If the "Denúncias" tab does not exist yet (e.g. they connected another sheet),
    // we try to write to A:L directly.
    const fallbackRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('A:L')}:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (fallbackRes.status === 401) {
      throw new Error('Sessão expirada. Reconecte sua conta do Google para continuar.');
    }
  }
}

// 3. Fully write/sync both header and complaints data
export async function syncSpreadsheetData(
  token: string,
  spreadsheetId: string,
  complaints: Complaint[]
): Promise<{ updatedComplaints: Complaint[]; changesMade: boolean }> {
  let changesMade = false;
  
  // Concurrently upload any pending photos to Google Drive
  const updatedComplaints = await Promise.all(
    complaints.map(async (c) => {
      if (c.fotoBase64 && !c.fotoUrl) {
        try {
          console.log(`Carregando imagem do protocolo ${c.protocolo} para o Google Drive...`);
          const { webViewLink } = await uploadPhotoToDrive(token, c.fotoBase64, c.fotoNome || `foto-${c.protocolo}.jpg`);
          changesMade = true;
          return {
            ...c,
            fotoUrl: webViewLink,
          };
        } catch (err: any) {
          console.error(`Falha no upload automático da imagem do protocolo ${c.protocolo}:`, err);
          const errMsg = err?.message || '';
          if (errMsg.includes('Insufficient Permission') || errMsg.includes('403') || errMsg.includes('permission') || errMsg.includes('Permissão')) {
            throw new Error('Permissões insuficientes no Google Drive. Por favor, clique em "Desconectar" no painel da planilha e conecte novamente para autorizar o envio de fotos.');
          }
        }
      }
      return c;
    })
  );

  // Try to clear old data first
  try {
    await clearSpreadsheetData(token, spreadsheetId);
  } catch (err: any) {
    if (err.message?.includes('Sessão expirada')) {
      throw err;
    }
    console.warn('Could not clear spreadsheet, writing with overwrite:', err);
  }

  const headers = [
    'Protocolo',
    'Categoria',
    'Título',
    'Descrição',
    'Bairro',
    'Rua / Endereço',
    'Nome do Denunciante',
    'Anonimato?',
    'Data de Envio',
    'Contato',
    'Status Atual',
    'Link da Foto',
  ];

  const rows = updatedComplaints.map((c) => [
    c.protocolo,
    CATEGORIES_MAP[c.tipo]?.label || c.tipo,
    c.titulo,
    c.descricao,
    c.bairro,
    c.rua,
    c.anonimo ? 'Anônimo (Segurança Ativa)' : c.nome,
    c.anonimo ? 'Sim' : 'Não',
    c.data,
    c.anonimo ? '-' : c.contato || '-',
    STATUS_MAP[c.status]?.label || c.status,
    c.fotoUrl || '',
  ]);

  const values = [headers, ...rows];

  // Try writing to the specifically named "Denúncias" sheet first
  let res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('Denúncias!A1')}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'Denúncias!A1',
        majorDimension: 'ROWS',
        values: values,
      }),
    }
  );

  if (res.status === 401) {
    throw new Error('Sessão expirada. Reconecte sua conta do Google para continuar.');
  }

  // If that failed (e.g. the connected sheet lacks a "Denúncias" tab), write to the default sheet at A1
  if (!res.ok) {
    res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('A1')}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: 'A1',
          majorDimension: 'ROWS',
          values: values,
        }),
      }
    );

    if (res.status === 401) {
      throw new Error('Sessão expirada. Reconecte sua conta do Google para continuar.');
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Falha ao sincronizar dados na planilha');
  }

  return { updatedComplaints, changesMade };
}

// Helper to parse status strings from Sheets back into code status identifiers
export function parseStatusLabel(
  label: string,
  fallback: 'recebida' | 'analise' | 'encaminhada' | 'resolvida' = 'recebida'
): 'recebida' | 'analise' | 'encaminhada' | 'resolvida' {
  if (!label) return fallback;
  const norm = label.trim().toLowerCase();
  
  // Clean string function to strip accents (e.g. "órgãos" -> "orgaos", "análise" -> "analise")
  const clean = norm.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (clean.includes('resolvid') || clean === 'ok' || clean.includes('concluid') || clean.includes('solucionad')) {
    return 'resolvida';
  }
  if (
    clean.includes('encaminhad') || 
    clean.includes('orgao') || 
    clean.includes('enviad') || 
    clean.includes('direcionad')
  ) {
    return 'encaminhada';
  }
  if (
    clean.includes('analis') || 
    clean.includes('analiz') || 
    clean.includes('exame') || 
    clean.includes('verificando') || 
    clean.includes('andamento')
  ) {
    return 'analise';
  }
  if (
    clean.includes('registrad') || 
    clean.includes('recebid') || 
    clean.includes('abert') || 
    clean.includes('novo') || 
    clean.includes('pauta')
  ) {
    return 'recebida';
  }

  // Fallbacks for extra broad checks
  if (clean.includes('resolvida') || clean.includes('resolvido')) return 'resolvida';
  if (clean.includes('analise') || clean.includes('análise')) return 'analise';
  if (clean.includes('encaminhada') || clean.includes('encaminhado')) return 'encaminhada';
  if (clean.includes('registrada') || clean.includes('recebida')) return 'recebida';

  return fallback;
}

// 4. Fetch the entire spreadsheet and import/update local complaints matching protocols
export async function importSpreadsheetUpdates(
  token: string,
  spreadsheetId: string,
  currentComplaints: Complaint[]
): Promise<{ updatedCount: number; complaints: Complaint[] }> {
  let rows: any[][] = [];
  try {
    // Try reading from "Denúncias!A:L"
    let res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('Denúncias!A:L')}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 401) {
      throw new Error('Sessão expirada. Reconecte sua conta do Google para continuar.');
    }

    if (!res.ok) {
      // Try generic A:L
      res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('A:L')}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 401) {
        throw new Error('Sessão expirada. Reconecte sua conta do Google para continuar.');
      }
    }

    if (res.ok) {
      const data = await res.json();
      rows = data.values || [];
    } else {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || 'Não foi possível ler as células da planilha.');
    }
  } catch (err: any) {
    if (err.message?.includes('Sessão expirada')) {
      throw err;
    }
    throw new Error('Planilha inacessível. Revise o link informado ou permissões.');
  }

  if (rows.length <= 1) {
    return { updatedCount: 0, complaints: currentComplaints };
  }

  const dataRows = rows.slice(1);

  // Clone current list of complaints into a map
  const complaintsMap = new Map<string, Complaint>();
  currentComplaints.forEach((c) => {
    complaintsMap.set(c.protocolo.trim().toUpperCase(), { ...c });
  });

  let updatedCount = 0;

  dataRows.forEach((row) => {
    const protocolVal = row[0]?.toString().trim().toUpperCase();
    if (!protocolVal) return;

    const existing = complaintsMap.get(protocolVal);
    const sheetsStatus = parseStatusLabel(row[10]?.toString() || '', existing?.status || 'recebida');
    
    if (existing) {
      let isUpdated = false;
      if (existing.status !== sheetsStatus) {
        existing.status = sheetsStatus;
        isUpdated = true;
      }
      
      // Optionally update other details if they diverge and were changed in sheets
      if (row[2] && existing.titulo !== row[2]) {
        existing.titulo = row[2];
        isUpdated = true;
      }
      if (row[3] && existing.descricao !== row[3]) {
        existing.descricao = row[3];
        isUpdated = true;
      }
      if (row[4] && existing.bairro !== row[4]) {
        existing.bairro = row[4];
        isUpdated = true;
      }
      if (row[5] && existing.rua !== row[5]) {
        existing.rua = row[5];
        isUpdated = true;
      }
      if (row[11] && existing.fotoUrl !== row[11]) {
        existing.fotoUrl = row[11];
        isUpdated = true;
      }

      if (isUpdated) {
        updatedCount++;
      }
    } else {
      // Import as a new complaint if typed manually in the sheet
      let foundCategory: any = 'outro';
      const catLabel = row[1]?.toString().trim().toLowerCase();
      if (catLabel) {
        for (const [key, val] of Object.entries(CATEGORIES_MAP)) {
          if (val.label.toLowerCase() === catLabel || key.toLowerCase() === catLabel) {
            foundCategory = key;
            break;
          }
        }
      }

      const isAnon = row[7]?.toString().trim().toLowerCase() === 'sim';

      const importedComplaint: Complaint = {
        protocolo: protocolVal,
        tipo: foundCategory,
        titulo: row[2]?.toString() || 'Denúncia Sincronizada',
        descricao: row[3]?.toString() || 'Sem descrição fornecida.',
        bairro: row[4]?.toString() || 'Outro',
        rua: row[5]?.toString() || '',
        nome: isAnon ? 'Anônimo' : (row[6]?.toString() || 'Cidadão'),
        anonimo: isAnon,
        data: row[8]?.toString() || new Date().toLocaleString('pt-BR'),
        contato: isAnon ? '' : (row[9]?.toString() || ''),
        status: sheetsStatus,
        fotoUrl: row[11]?.toString() || undefined,
      };

      complaintsMap.set(protocolVal, importedComplaint);
      updatedCount++;
    }
  });

  return {
    updatedCount,
    complaints: Array.from(complaintsMap.values()),
  };
}
