import { motion } from 'motion/react';
import { ShieldCheck, Users, ArrowRight, Activity, Handshake, MapPin, Compass } from 'lucide-react';

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
    hidden: { y: 25, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <section 
      id="inicio" 
      className="relative min-h-[95vh] flex items-center justify-center pt-36 pb-20 px-4 md:px-8 bg-neutral-950 overflow-hidden"
    >
      {/* 1. Base Wallpaper layer with Leme Flag (Luminosity blend for seamless dark UI integration) */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-no-repeat bg-center bg-cover opacity-[0.15] mix-blend-luminosity filter saturate-50"
        style={{
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/3/3e/Bandeira_Leme_SaoPaulo_Brasil.svg')",
        }}
      />

      {/* 2. Linear and Radial dark vignettes to focus typography and keep extreme margins pitch black */}
      <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent via-neutral-950/80 to-neutral-950 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-neutral-950 via-transparent to-neutral-950 pointer-events-none" />

      {/* 3. Micro Grid lines overlaid for tech-forward precision */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* 4. Elegant Blue ambient glow centered behind title */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/15 blur-[130px] rounded-full pointer-events-none" />

      {/* Main content wrapper */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        {/* Leme Project Custom Badge */}
        <motion.div 
          variants={itemVariants} 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/40 border border-blue-500/20 text-blue-300 text-xs font-semibold tracking-wider uppercase mb-8 backdrop-blur-md"
        >
          <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>PROJETO CIDADÃO &bull; LEME - SP</span>
        </motion.div>

        {/* Dynamic Display Typography */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6"
        >
          Leme merece mais.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
            Comece por você.
          </span>
        </motion.h1>

        {/* Clean responsive description */}
        <motion.p
          variants={itemVariants}
          className="text-neutral-300/90 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto mb-10"
        >
          Registre irregularidades da sua região. Organizada coletivamente, compilamos, documentamos e cobramos providências para acelerar melhorias públicas reais.
        </motion.p>

        {/* Premium Horizontal Glassmorphic Metrics Grid */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-3xl mx-auto mb-12 p-1 bg-neutral-950/20 backdrop-blur-lg border border-blue-900/20 rounded-2xl shadow-2xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-2 py-6 px-4 md:px-6">
            {/* Stat 1 */}
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 px-2">
              <div className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-800/25">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-center md:text-left">
                <div className="text-sm font-extrabold text-white tracking-tight leading-none mb-1">
                  104 mil
                </div>
                <div className="text-[11px] text-neutral-400 font-medium">
                  habitantes
                </div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 px-2 md:border-l border-neutral-800/40">
              <div className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-800/25">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-center md:text-left">
                <div className="text-sm font-extrabold text-white tracking-tight leading-none mb-1">
                  Interior
                </div>
                <div className="text-[11px] text-neutral-400 font-medium">
                  Paulista
                </div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 px-2 border-l border-neutral-800/40">
              <div className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-800/25">
                <Handshake className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-center md:text-left">
                <div className="text-sm font-extrabold text-white tracking-tight leading-none mb-1">
                  Plataforma
                </div>
                <div className="text-[11px] text-neutral-400 font-medium leading-tight">
                  de fiscalização cidadã
                </div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 px-2 border-l border-neutral-800/40">
              <div className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-800/25">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-center md:text-left">
                <div className="text-sm font-extrabold text-white tracking-tight leading-none mb-1">
                  Transparência
                </div>
                <div className="text-[11px] text-neutral-400 font-medium">
                  e impacto real
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Button CTA Panel */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 max-w-md mx-auto"
        >
          <button
            onClick={() => onActionClick('denuncia')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            Registrar Denúncia Online
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onActionClick('como-funciona')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-950/40 hover:bg-neutral-900 border border-neutral-800 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            Entender o Fluxo
          </button>
        </motion.div>

        {/* Coordinates Block Footer */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col items-center justify-center mt-6 text-xs text-neutral-400"
        >
          <div className="flex items-center gap-1.5 text-blue-500 font-mono tracking-wider font-semibold">
            <Compass className="w-4 h-4 text-blue-400 animate-spin-slow" />
            <span>22°11'08"S &bull; 47°23'25"W</span>
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 font-medium">
            Nosso compromisso é com Leme.
          </span>
        </motion.div>

      </motion.div>
    </section>
  );
}

