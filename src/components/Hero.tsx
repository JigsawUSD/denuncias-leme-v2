import { motion } from 'motion/react';
import { ShieldCheck, EyeOff, Users, ArrowRight, Activity, HandHelping } from 'lucide-react';

interface HeroProps {
  totalCount: number;
  onActionClick: (id: string) => void;
}

export function Hero({ totalCount, onActionClick }: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const scrollToSelector = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="inicio" className="relative min-h-[90vh] flex items-center justify-center pt-36 pb-20 px-4 md:px-8 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">
      {/* Dynamic graphic particles or map network grid lines in background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative colored glow representing blue of Leme */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        {/* Leme Project Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/20 text-blue-300 text-xs font-semibold tracking-wider uppercase mb-8">
          <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Projeto Cidadão &bull; Leme - SP</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6"
        >
          Leme merece mais.<br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-200 to-white">
            Comece por você.
          </span>
        </motion.h1>

        {/* Hero Description */}
        <motion.p
          variants={itemVariants}
          className="text-neutral-400 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto mb-10"
        >
          Registre irregularidades da sua região. Organizada coletivamente, compilamos, documentamos e cobramos providências para acelerar melhorias públicas reais.
        </motion.p>

        {/* Active counter & CTA Panel */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => scrollToSelector('denuncia')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            Registrar Denúncia Online
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => scrollToSelector('como-funciona')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white px-8 py-4 rounded-xl transition-all duration-200"
          >
            Entender o Fluxo
          </button>
        </motion.div>

        {/* Live Metrics Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-1 p-1 bg-neutral-900/50 border border-neutral-800/80 rounded-2xl md:divide-x divide-neutral-800/80 max-w-3xl mx-auto shadow-sm"
        >
          <div className="flex flex-col items-center justify-center py-6 px-4">
            <span className="text-3xl font-extrabold text-white tracking-tight mb-1">
              {totalCount}
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              Denúncias Totais Ativas
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-6 px-4">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight mb-1 flex items-center gap-1">
              100%
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              Anônimo &amp; Gratuito
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-6 px-4">
            <span className="text-3xl font-extrabold text-blue-400 tracking-tight mb-1">
              Livre
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              Sem Vínculo Partidário
            </span>
          </div>
        </motion.div>

        {/* Feature anchors */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12 text-neutral-400 text-xs font-semibold uppercase tracking-wider"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Dados Criptografados</span>
          </div>
          <div className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-blue-400" />
            <span>Opcionalidade de Anonimato</span>
          </div>
          <div className="flex items-center gap-2">
            <HandHelping className="w-5 h-5 text-amber-500" />
            <span>Foco em Transparência</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
