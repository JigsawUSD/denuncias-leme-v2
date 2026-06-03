import { Complaint, ComplaintCategory } from './types';

export const CATEGORIES_MAP: Record<
  ComplaintCategory,
  { label: string; description: string; icon: string }
> = {
  infraestrutura: {
    label: 'Buracos, calçadas e vias',
    description: 'Asfalto danificado, calçadas inacessíveis ou problemas viários',
    icon: 'Hammer',
  },
  iluminacao: {
    label: 'Iluminação pública',
    description: 'Postes apagados, lâmpadas queimadas ou trechos escuros',
    icon: 'Lightbulb',
  },
  saude: {
    label: 'Saúde',
    description: 'Atendimento em postos de saúde, UPAs, falta de médicos ou insumos',
    icon: 'HeartPulse',
  },
  educacao: {
    label: 'Educação',
    description: 'Condições de escolas, creches ou do transporte escolar',
    icon: 'GraduationCap',
  },
  seguranca: {
    label: 'Segurança pública',
    description: 'Falta de policiamento, iluminação deficiente ou pontos inseguros',
    icon: 'Shield',
  },
  criminalidade: {
    label: 'Criminalidade',
    description: 'Ocorrências de roubo, furto, tráfico ou vandalismo',
    icon: 'AlertTriangle',
  },
  importunacao: {
    label: 'Importunação sexual',
    description: 'Atos libidinosos sem consentimento em espaços públicos',
    icon: 'UserX',
  },
  ameaca: {
    label: 'Ameaça / Intimidação',
    description: 'Coação, assédio moral ou situações de risco pessoal',
    icon: 'ShieldAlert',
  },
  saneamento: {
    label: 'Saneamento / Água / Esgoto',
    description: 'Vazamentos de água, esgoto a céu aberto ou falta de abastecimento',
    icon: 'Droplet',
  },
  meio_ambiente: {
    label: 'Meio ambiente',
    description: 'Poluição, descarte irregular de lixo, desmatamento ou maus-tratos',
    icon: 'Trees',
  },
  transporte: {
    label: 'Transporte público / ônibus',
    description: 'Atrasos de ônibus, linhas suspensas ou abrigos quebrados',
    icon: 'Bus',
  },
  obras: {
    label: 'Obras paralisadas',
    description: 'Construções públicas interrompidas ou abandonadas',
    icon: 'Construction',
  },
  materia: {
    label: 'Mau uso de verba pública',
    description: 'Indícios de desperdício, superfaturamento ou desvio de recursos',
    icon: 'Coins',
  },
  outro: {
    label: 'Outro',
    description: 'Outras irregularidades não listadas acima',
    icon: 'FileText',
  },
};

export const STATUS_MAP: Record<
  Complaint['status'],
  { label: string; colorClass: string; bgClass: string; borderClass: string }
> = {
  recebida: {
    label: 'Registrada',
    colorClass: 'text-neutral-700 dark:text-neutral-300',
    bgClass: 'bg-neutral-100 dark:bg-neutral-800',
    borderClass: 'border-neutral-200 dark:border-neutral-700',
  },
  analise: {
    label: 'Em Análise',
    colorClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    borderClass: 'border-amber-200 dark:border-amber-900/60',
  },
  encaminhada: {
    label: 'Encaminhada aos Órgãos',
    colorClass: 'text-blue-700 dark:text-blue-300',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    borderClass: 'border-blue-200 dark:border-blue-900/60',
  },
  resolvida: {
    label: 'Resolvida',
    colorClass: 'text-emerald-700 dark:text-emerald-300',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200 dark:border-emerald-900/60',
  },
};

export const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    protocolo: 'LEM-2026-4512',
    tipo: 'infraestrutura',
    titulo: 'Buraco imenso na Av. 29 de Agosto',
    descricao: 'Há um buraco enorme no meio da avenida principal que está forçando motoristas a desviarem na contramão, oferecendo grave risco de colisão frontal. Já causou danos a pelo menos três veículos esta semana.',
    bairro: 'Centro',
    rua: 'Av. 29 de Agosto, altura do nº 1200',
    nome: 'Carlos Eduardo Oliveira',
    anonimo: true,
    data: '28/05/2026 14:32:00',
    status: 'encaminhada',
  },
  {
    protocolo: 'LEM-2026-8941',
    tipo: 'iluminacao',
    titulo: 'Poste de luz apagado há mais de duas semanas',
    descricao: 'Toda a extensão da rua está muito escura por conta de duas lâmpadas queimadas nos postes de iluminação pública. Moradores estão com medo de assaltos por causa da escuridão extrema no período da noite.',
    bairro: 'Jardim Barra Mansa',
    rua: 'Rua Newton Prado, nº 340',
    nome: 'Márcia Silva Rocha',
    anonimo: false,
    data: '30/05/2026 21:15:00',
    status: 'resolvida',
  },
  {
    protocolo: 'LEM-2026-2315',
    tipo: 'saude',
    titulo: 'Falta prolongada de pediatras no Posto de Saúde',
    descricao: 'Várias mães com crianças pequenas estão há dias voltando para casa sem atendimento pediátrico, pois a UBS informa que o especialista está de licença e não há substituto planejado.',
    bairro: 'Jardim Primavera',
    rua: 'UBS Dr. Leme, Rua Carlos Gomes',
    nome: 'Letícia de Castro',
    anonimo: false,
    data: '01/06/2026 09:40:00',
    status: 'analise',
  },
  {
    protocolo: 'LEM-2026-1077',
    tipo: 'saneamento',
    titulo: 'Vazamento de água tratada escorrendo na calçada',
    descricao: 'Vazamento volumoso de água vindo de uma tubulação rompida sob a calçada. Está desperdiçando milhares de litros de água tratada ininterruptamente, além de estar infiltrando no muro vizinho.',
    bairro: 'Vila Joest',
    rua: 'Rua Coronel João Franco Mourão, próx. à praça',
    nome: 'Antônio Ferreira Reis',
    anonimo: true,
    data: '02/06/2026 16:10:00',
    status: 'recebida',
  },
];
