import {
  Hammer,
  Lightbulb,
  HeartPulse,
  GraduationCap,
  Shield,
  AlertTriangle,
  UserX,
  ShieldAlert,
  Droplet,
  Trees,
  Bus,
  Construction,
  Coins,
  FileText,
  LucideIcon,
} from 'lucide-react';
import { ComplaintCategory } from '../types';

const iconMap: Record<ComplaintCategory, LucideIcon> = {
  infraestrutura: Hammer,
  iluminacao: Lightbulb,
  saude: HeartPulse,
  educacao: GraduationCap,
  seguranca: Shield,
  criminalidade: AlertTriangle,
  importunacao: UserX,
  ameaca: ShieldAlert,
  saneamento: Droplet,
  meio_ambiente: Trees,
  transporte: Bus,
  obras: Construction,
  materia: Coins,
  outro: FileText,
};

interface CategoryIconProps {
  category: ComplaintCategory;
  className?: string;
}

export function CategoryIcon({ category, className = 'w-6 h-6' }: CategoryIconProps) {
  const IconComponent = iconMap[category] || FileText;
  return <IconComponent className={className} />;
}
