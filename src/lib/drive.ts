import { getAccessToken } from './auth';

// Helper to convert base64 image data to a Blob
export function base64ToBlob(base64Data: string, contentType: string = 'image/jpeg'): Blob {
  let base64 = base64Data;
  if (base64Data.includes(',')) {
    base64 = base64Data.split(',')[1];
  }
  
  const byteCharacters = atob(base64);
  const byteArrays: Uint8Array[] = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: contentType });
}

// Helper to parse mime type from base64 string
export function getMimeTypeFromBase64(base64: string): string {
  const match = base64.match(/^data:([^;]+);/);
  return match ? match[1] : 'image/jpeg';
}

/**
 * Uploads a base64 encoded photo to Google Drive
 * and grants public read access to anyone with the link.
 */
export async function uploadPhotoToDrive(
  token: string,
  base64Data: string,
  fileName: string = 'denuncia_foto.jpg'
): Promise<{ fileId: string; webViewLink: string }> {
  try {
    const contentType = getMimeTypeFromBase64(base64Data);
    const blob = base64ToBlob(base64Data, contentType);
    
    const boundary = 'foo_bar_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const colDelimiter = `\r\n--${boundary}`;
    const closeDelimiter = `\r\n--${boundary}--`;
    
    const metadata = {
      name: fileName,
      mimeType: contentType,
    };
    
    // Read blob into array buffer
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
    
    const fileBytes = new Uint8Array(arrayBuffer);
    
    // Construct byte parts
    const encoder = new TextEncoder();
    const metaHeader = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
    const fileHeader = `${delimiter}Content-Type: ${contentType}\r\n\r\n`;
    const footer = `${closeDelimiter}`;
    
    const metaHeaderBytes = encoder.encode(metaHeader);
    const fileHeaderBytes = encoder.encode(fileHeader);
    const footerBytes = encoder.encode(footer);
    
    const totalLength = metaHeaderBytes.length + fileHeaderBytes.length + fileBytes.length + footerBytes.length;
    const bodyBytes = new Uint8Array(totalLength);
    
    let offset = 0;
    bodyBytes.set(metaHeaderBytes, offset);
    offset += metaHeaderBytes.length;
    bodyBytes.set(fileHeaderBytes, offset);
    offset += fileHeaderBytes.length;
    bodyBytes.set(fileBytes, offset);
    offset += fileBytes.length;
    bodyBytes.set(footerBytes, offset);
    
    // Post to Google Drive upload API
    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: bodyBytes,
      }
    );
    
    if (!uploadRes.ok) {
      const errorMsg = await uploadRes.text();
      throw new Error(`Upload para o Drive falhou: ${errorMsg}`);
    }
    
    const fileData = await uploadRes.json();
    const fileId = fileData.id;
    
    // Fallback: build view URL manually if not provided in metadata response
    const webViewLink = fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`;
    
    // Make file accessible to "anyone" who has the link
    try {
      const permRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      });
      if (!permRes.ok) {
        console.warn('Permissão de compartilhamento falhou com status:', permRes.status);
      }
    } catch (permError) {
      console.warn('Não foi possível definir permissões de leitura pública no arquivo de imagem:', permError);
    }
    
    return {
      fileId,
      webViewLink,
    };
  } catch (error) {
    console.error('Erro ao fazer upload da imagem para o Google Drive:', error);
    throw error;
  }
}
