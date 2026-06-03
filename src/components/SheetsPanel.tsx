import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  RefreshCw,
  LogOut,
  CheckCircle2,
  ExternalLink,
  Plus,
  Link,
  AlertCircle,
  Sparkles,
  Download,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  logout,
  clearSessionToken,
} from '../lib/auth';
import {
  createGoogleSpreadsheet,
  syncSpreadsheetData,
  parseSpreadsheetId,
  importSpreadsheetUpdates,
} from '../lib/sheets';
import { Complaint } from '../types';

interface SheetsPanelProps {
  complaints: Complaint[];
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onUpdateComplaints?: (updated: Complaint[]) => void;
}

export function SheetsPanel({ complaints, addToast, onUpdateComplaints }: SheetsPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Custom Confirmation States for Sandbox iFrame
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false);

  // Sheets Config
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('sheets_spreadsheet_id') || '';
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(() => {
    return localStorage.getItem('sheets_spreadsheet_url') || '';
  });
  const [autoSync, setAutoSync] = useState<boolean>(() => {
    return localStorage.getItem('sheets_auto_sync') === 'true';
  });

  const [inputUrl, setInputUrl] = useState('');
  const [isIframe, setIsIframe] = useState(false);

  // 1. Initialize Auth on mount
  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }

    const unsubscribe = initAuth(
      (currentUser, cachedToken) => {
        setUser(currentUser);
        setToken(cachedToken);
        setLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Handle Login
  const handleLogin = async () => {
    setActionLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        addToast('Conexão com Google autorizada com sucesso!', 'success');
      }
    } catch (err: any) {
      console.error('Sign in error details:', err);
      const errMsg = err?.message || 'Erro desconhecido';
      const errCode = err?.code || '';
      addToast(`Falha na autenticação do Google: ${errCode ? `[${errCode}] ` : ''}${errMsg}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Handle Logout Confirmation handlers
  const handleLogoutClick = () => {
    setIsConfirmingLogout(true);
  };

  const handleLogoutCancel = () => {
    setIsConfirmingLogout(false);
  };

  const executeLogout = async () => {
    setIsConfirmingLogout(false);
    setActionLoading(true);
    try {
      await logout();
      setUser(null);
      setToken(null);
      addToast('Desconectado da conta Google com sucesso.', 'info');
    } catch (err) {
      console.error(err);
      addToast('Erro ao desconectar conta Google.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const checkSessionExpired = (err: any) => {
    if (err.message && (err.message.includes('Sessão expirada') || err.message.includes('expired') || err.message.includes('Unauthorized') || err.message.includes('401'))) {
      clearSessionToken();
      setUser(null);
      setToken(null);
      addToast('Sua sessão expirou ou foi revogada. Por favor, conecte sua conta Google novamente para reautorizar.', 'error');
      return true;
    }
    return false;
  };

  // 4. Create brand new sheet
  const handleCreateSheet = async () => {
    if (!token) {
      addToast('Por favor, conecte sua conta Google primeiro.', 'info');
      return;
    }

    setActionLoading(true);
    try {
      const result = await createGoogleSpreadsheet(token, 'Ouvidoria Leme');
      setSpreadsheetId(result.id);
      setSpreadsheetUrl(result.url);
      localStorage.setItem('sheets_spreadsheet_id', result.id);
      localStorage.setItem('sheets_spreadsheet_url', result.url);

      addToast('Nova planilha criada no Google Drive com sucesso!', 'success');

      // Sync complaints immediately
      const syncRes = await syncSpreadsheetData(token, result.id, complaints);
      if (syncRes.changesMade && onUpdateComplaints) {
        onUpdateComplaints(syncRes.updatedComplaints);
      }
      addToast('Todas as denúncias foram sincronizadas no novo documento!', 'success');
    } catch (err: any) {
      console.error(err);
      if (!checkSessionExpired(err)) {
        addToast(err.message || 'Erro ao criar a planilha no Google.', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Connect existing sheet
  const handleConnectExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      addToast('Por favor, conecte sua conta Google primeiro.', 'info');
      return;
    }

    const parsedId = parseSpreadsheetId(inputUrl);
    if (!parsedId) {
      addToast('Por favor, informe um link ou ID de planilha válido.', 'error');
      return;
    }

    // A valid Google Sheets ID is typically much longer (usually 44 characters).
    // If it's too short (like typing "Leme2026"), it's definitely an error.
    if (parsedId.length < 20) {
      addToast('O ID informado é inválido. Por favor, cole o link completo da sua Planilha Google no campo de texto.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const generatedUrl = `https://docs.google.com/spreadsheets/d/${parsedId}`;
      setSpreadsheetId(parsedId);
      setSpreadsheetUrl(generatedUrl);
      localStorage.setItem('sheets_spreadsheet_id', parsedId);
      localStorage.setItem('sheets_spreadsheet_url', generatedUrl);
      setInputUrl('');
      addToast('Planilha vinculada com sucesso!', 'success');

      // Sync complaints immediately
      const syncRes = await syncSpreadsheetData(token, parsedId, complaints);
      if (syncRes.changesMade && onUpdateComplaints) {
        onUpdateComplaints(syncRes.updatedComplaints);
      }
      addToast('DADOS SINCRONIZADOS: Planilha populada com o mural público.', 'success');
    } catch (err: any) {
      console.error(err);
      if (!checkSessionExpired(err)) {
        addToast('Erro ao sincronizar com a planilha indicada: verifique as permissões de acesso ou o link.', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Manual force sync
  const handleForceSync = async () => {
    if (!token) {
      addToast('Sua sessão expirou. Conecte de novo com o Google.', 'error');
      return;
    }
    if (!spreadsheetId) {
      addToast('Nenhuma planilha vinculada para sincronização.', 'info');
      return;
    }

    setActionLoading(true);
    try {
      const syncRes = await syncSpreadsheetData(token, spreadsheetId, complaints);
      if (syncRes.changesMade && onUpdateComplaints) {
        onUpdateComplaints(syncRes.updatedComplaints);
      }
      addToast('Sincronização completa realizada com sucesso!', 'success');
    } catch (err: any) {
      console.error(err);
      if (!checkSessionExpired(err)) {
        addToast(err.message || 'Ocorreu um erro ao atualizar os dados na planilha.', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // 6.5. Pull Updates from Google Sheets
  const handlePullUpdates = async () => {
    if (!token) {
      addToast('Sua sessão expirou. Conecte de novo com o Google.', 'error');
      return;
    }
    if (!spreadsheetId) {
      addToast('Nenhuma planilha vinculada para buscar atualizações.', 'info');
      return;
    }

    setActionLoading(true);
    try {
      const result = await importSpreadsheetUpdates(token, spreadsheetId, complaints);
      if (onUpdateComplaints) {
        onUpdateComplaints(result.complaints);
      }
      if (result.updatedCount > 0) {
        addToast(`Sincronização bidirecional concluída! ${result.updatedCount} alteração(ões)/status de denúncia foram importados da planilha com sucesso!`, 'success');
      } else {
        addToast('Sincronização concluída: Nenhuma alteração nova foi detectada na sua planilha.', 'info');
      }
    } catch (err: any) {
      console.error(err);
      if (!checkSessionExpired(err)) {
        addToast(err.message || 'Ocorreu um erro ao buscar atualizações de status da planilha.', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Toggle auto sync flag
  const handleToggleAutoSync = (checked: boolean) => {
    setAutoSync(checked);
    localStorage.setItem('sheets_auto_sync', String(checked));
    if (checked) {
      addToast('Auto-sincronização de futuras denúncias ativada!', 'success');
    } else {
      addToast('Auto-sincronização desativada.', 'info');
    }
  };

  // 8. Delete connection with active Spreadsheet
  const handleDisconnectClick = () => {
    setIsConfirmingDisconnect(true);
  };

  const handleDisconnectCancel = () => {
    setIsConfirmingDisconnect(false);
  };

  const executeDisconnectSheet = () => {
    setIsConfirmingDisconnect(false);
    setSpreadsheetId('');
    setSpreadsheetUrl('');
    localStorage.removeItem('sheets_spreadsheet_id');
    localStorage.removeItem('sheets_spreadsheet_url');
    addToast('Planilha desvinculada. Seus dados permanecem seguros no Google Drive.', 'info');
  };

  if (loading) {
    return (
      <div className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-2xl flex items-center justify-center min-h-[220px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="text-sm text-neutral-400">Verificando estado de conexão com Google...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-neutral-950 via-neutral-950 to-emerald-950/10 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-2xl">
      {/* Decorative top bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
      
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-900">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 px-2.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-mono font-bold tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Integração Cidadã
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
              Sincronização com Google Planilhas
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1">
              Exporte em tempo real, gere painéis de Business Intelligence (BI/Looker Studio) e publique dados abertos de Ouvidoria com o Google Sheets.
            </p>
          </div>

          {!user ? (
            isIframe ? (
              <button
                onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
                className="p-2.5 bg-amber-600 hover:bg-amber-500 border border-amber-500/30 text-white rounded-xl text-xs transition-all cursor-pointer font-bold inline-flex items-center gap-1.5 shadow-md shadow-amber-900/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4 text-amber-200" />
                Abrir em Nova Aba
              </button>
            ) : (
              /* Custom standard button aligned with Google design policy */
              <button
                onClick={handleLogin}
                disabled={actionLoading}
                className="gsi-material-button self-start lg:self-center cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper font-sans">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-semibold">{actionLoading ? 'Conectando...' : 'Conectar Conta Google'}</span>
                </div>
              </button>
            )
          ) : (
            <div className="flex flex-wrap items-center gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-neutral-800" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'G'}
                  </div>
                )}
                <div>
                  <span className="text-xs text-neutral-300 font-bold block leading-none">{user.displayName || 'Usuário Google'}</span>
                  <span className="text-[10px] text-neutral-500 font-mono block mt-1">{user.email}</span>
                </div>
              </div>
              {isConfirmingLogout ? (
                <div className="flex items-center gap-1.5 bg-neutral-950/80 p-1.5 px-2 rounded-lg border border-red-500/20 animate-pulse shrink-0 ml-2">
                  <span className="text-[10px] text-red-450 font-bold uppercase tracking-wider">Sair?</span>
                  <button
                    onClick={executeLogout}
                    disabled={actionLoading}
                    className="p-1 px-2.5 bg-red-650 hover:bg-red-600 text-white text-[10px] font-bold rounded cursor-pointer transition-all"
                  >
                    Sim
                  </button>
                  <button
                    onClick={handleLogoutCancel}
                    className="p-1 px-2 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-[10px] font-bold rounded cursor-pointer transition-all"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogoutClick}
                  disabled={actionLoading}
                  className="ml-2 p-2 bg-neutral-950 hover:bg-red-500/15 border border-neutral-800 hover:border-red-500/25 rounded-lg text-neutral-400 hover:text-red-400 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Desconectar conta Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Section */}
        {!user ? (
          <div className="p-8 border border-neutral-800 rounded-xl mt-6 bg-neutral-950/40">
            <LockOverlay onClick={handleLogin} isIframe={isIframe} />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            {/* If no Spreadsheet configured */}
            {!spreadsheetId ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                {/* Creator Option */}
                <div className="md:col-span-6 bg-neutral-900/30 p-6 rounded-xl border border-neutral-900 hover:border-emerald-500/10 transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-2">Opção Comercial & Fácil</span>
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Plus className="w-4.5 h-4.5 text-emerald-500" />
                      Criar nova planilha automaticamente
                    </h4>
                    <p className="text-neutral-400 text-xs mt-2 leading-relaxed">
                      Geramos um novo arquivo formatado com cabeçalhos profissionais no seu Google Drive (raiz) e enviamos todos os registros do Mural instantaneamente.
                    </p>
                  </div>
                  <button
                    onClick={handleCreateSheet}
                    disabled={actionLoading}
                    className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-emerald-950/20 border border-emerald-500/40 cursor-pointer"
                  >
                    {actionLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Criar e Sincronizar pelo Drive
                  </button>
                </div>

                {/* Linking Option */}
                <div className="md:col-span-6 bg-neutral-900/30 p-6 rounded-xl border border-neutral-900 hover:border-emerald-500/10 transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-2">Vincular Planilha</span>
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Link className="w-4.5 h-4.5 text-blue-500" />
                      Conectar planilha existente
                    </h4>
                    <p className="text-neutral-400 text-xs mt-2 leading-relaxed">
                      Possui uma planilha existente? Cole a URL direta ou ID do documento para sincronizar as denúncias no arquivo.
                    </p>
                  </div>

                  <form onSubmit={handleConnectExisting} className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="Cole o link completo da Planilha ou o ID..."
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={actionLoading || !inputUrl.trim()}
                      className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold px-4 rounded-xl text-xs flex items-center transition-all border border-neutral-800 cursor-pointer disabled:opacity-55"
                    >
                      Vincular
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* If Spreadsheet IS active */
              <div className="bg-neutral-900/20 p-6 rounded-xl border border-neutral-900/80 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-950 p-4 rounded-lg border border-neutral-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                      <CheckCircle2 className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white block">Planilha Ativa & Sincronizada</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono block mt-1 select-all">{spreadsheetId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                      Visualizar Planilha
                    </a>
                    
                    {isConfirmingDisconnect ? (
                      <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 px-2 rounded-lg border border-red-500/20">
                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Desvincular?</span>
                        <button
                          onClick={executeDisconnectSheet}
                          className="p-1 px-2.5 bg-red-650 hover:bg-red-600 text-white text-[10px] font-bold rounded cursor-pointer transition-all"
                        >
                          Sim
                        </button>
                        <button
                          onClick={handleDisconnectCancel}
                          className="p-1 px-2 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-[10px] font-bold rounded cursor-pointer transition-all"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleDisconnectClick}
                        className="p-2.5 bg-neutral-900 hover:bg-neutral-850 border border-transparent hover:border-red-950 text-red-400/80 hover:text-red-400 rounded-lg text-xs transition-all cursor-pointer"
                        title="Desvincular Planilha"
                      >
                        Remover Vínculo
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-neutral-900 pb-5">
                  {/* Autosync option */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => handleToggleAutoSync(e.target.checked)}
                      className="w-4.5 h-4.5 accent-emerald-500 text-emerald-600 bg-neutral-950 border-neutral-800 rounded focus:ring-emerald-500 focus:ring-2 focus:ring-offset-neutral-950 focus:ring-offset-2 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Sincronização Automática</span>
                      <span className="text-[10px] text-neutral-500 block mt-0.5">Envia novas denúncias à planilha em segundo plano assim que registradas.</span>
                    </div>
                  </label>

                  {/* Manual Both-way Triggers */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Pull Button */}
                    <button
                      onClick={handlePullUpdates}
                      disabled={actionLoading}
                      className="bg-neutral-950 hover:bg-neutral-900 text-neutral-200 hover:text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-neutral-800 hover:border-neutral-700 shadow-md cursor-pointer disabled:opacity-50"
                      title="Importa alterações feitas na planilha de volta para o site (incluindo alteração de status)"
                    >
                      <Download className={`w-4.5 h-4.5 text-emerald-500 ${actionLoading ? 'animate-pulse' : ''}`} />
                      Buscar Atualizações da Planilha (Planilha → Site)
                    </button>

                    {/* Push Button */}
                    <button
                      onClick={handleForceSync}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-emerald-500/30 shadow-md cursor-pointer disabled:opacity-50"
                      title="Sobrescreve a planilha com os dados atuais do site"
                    >
                      <RefreshCw className={`w-4.5 h-4.5 ${actionLoading ? 'animate-spin' : ''}`} />
                      Sincronizar Mural Completo ({complaints.length})
                    </button>
                  </div>
                </div>

                {/* Administrative status guidelines */}
                <div className="text-[11px] text-neutral-400 bg-neutral-950/80 p-3.5 rounded-lg border border-neutral-900 leading-relaxed">
                  <p className="font-bold text-neutral-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Como atualizar os status no site a partir da Planilha:
                  </p>
                  Qualquer alteração feita na coluna <strong className="text-emerald-400 font-mono">"Status Atual"</strong> da planilha Google (pelas opções: <em>"Registrada"</em>, <em>"Em Análise"</em>, <em>"Encaminhada aos Órgãos"</em> ou <em>"Resolvida"</em>) será imediatamente enviada ao site assim que você clicar no botão <strong className="text-white">"Buscar Atualizações da Planilha"</strong> acima!
                </div>
              </div>
            )}
            
            <div className="p-3 bg-neutral-900/30 border border-neutral-900/60 rounded-xl flex items-start gap-2.5 text-[11px] text-neutral-500 leading-relaxed italic">
              <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
              <span>
                <strong>Nota:</strong> A Ouvidoria assegura que as queixas marcadas com Anonimato enviam a identificação sob o rótulo de <em>&quot;Anônimo (Segurança Ativa)&quot;</em> para a planilha, mantendo a privacidade estrita do manifestante mesmo em documentos de uso interno corporativo.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LockOverlay({ onClick, isIframe }: { onClick: () => void; isIframe: boolean }) {
  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col items-center py-6 text-center max-w-xl mx-auto">
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full inline-flex items-center justify-center mb-4">
        <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
      </div>
      <h4 className="text-lg font-black text-white">Sincronização Ativa com Google Drive & Planilhas</h4>
      <p className="text-neutral-400 text-xs sm:text-sm mt-2 mb-6 leading-relaxed">
        Com esta ferramenta você pode gerar relatórios em tempo real, conectar dashboards do Looker Studio e atualizar o status de denúncias diretamente do Excel Online/Google Sheets.
      </p>

      {isIframe ? (
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-6 text-left shadow-lg">
          <div className="flex gap-3">
            <span className="text-2xl mt-0.5 shrink-0">⚠️</span>
            <div>
              <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-1">
                Restrição de Janela Incorporada (Iframe)
              </h5>
              <p className="text-neutral-300 text-xs leading-relaxed">
                O Google de forma segura impede logins com sua conta dentro de ambientes incorporados (janelas de rascunho do editor lateral).
                Para resolver:
              </p>
              <ol className="list-decimal list-inside text-neutral-400 text-[11px] mt-2 gap-1 flex flex-col font-medium">
                <li>Clique no botão <strong className="text-white font-semibold">"Abrir Portal em Nova Aba"</strong> abaixo.</li>
                <li>Na nova guia lateral, clique em <strong className="text-emerald-400 font-semibold">"Vincular conta do Google"</strong>.</li>
                <li>Sua conta conectará perfeitamente, e sincronizará em toda a rede!</li>
              </ol>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
            <button
              onClick={handleOpenNewTab}
              className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 border border-amber-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir Portal em Nova Aba
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onClick}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold border border-emerald-500/40 rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-950/15"
        >
          <Link className="w-4 h-4 text-emerald-200" />
          Vincular Conta Google e Começar
        </button>
      )}
    </div>
  );
}
