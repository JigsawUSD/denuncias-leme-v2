export type ComplaintCategory =
  | 'infraestrutura'
  | 'iluminacao'
  | 'saude'
  | 'educacao'
  | 'seguranca'
  | 'criminalidade'
  | 'importunacao'
  | 'ameaca'
  | 'saneamento'
  | 'meio_ambiente'
  | 'transporte'
  | 'obras'
  | 'materia'
  | 'outro';

export interface Complaint {
  protocolo: string;
  tipo: ComplaintCategory;
  titulo: string;
  descricao: string;
  bairro: string;
  rua: string;
  fotoBase64?: string;
  fotoNome?: string;
  fotoUrl?: string;
  nome: string;
  contato?: string;
  anonimo: boolean;
  data: string;
  status: 'recebida' | 'analise' | 'encaminhada' | 'resolvida';
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
