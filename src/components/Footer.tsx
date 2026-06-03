import { Landmark, ArrowUp } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 py-12 px-4 md:px-8 text-neutral-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Information */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-blue-500 flex items-center justify-center border border-neutral-800">
            <Landmark className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="font-bold text-sm text-neutral-300 block">
              Denúncia Leme
            </span>
            <span className="text-[10px] text-neutral-600 block uppercase tracking-wider">
              Projeto Cidadão &bull; 2026
            </span>
          </div>
        </div>

        {/* Core Tagline */}
        <p className="text-xs text-neutral-400 text-center md:text-left leading-relaxed max-w-md">
          Feito pela população de Leme, para a população de Leme. Um esforço coletivo para melhorar de forma transparente e apartidária nossa infraestrutura urbana.
        </p>

        {/* Scroll back to top button */}
        <button
          onClick={scrollToTop}
          type="button"
          className="p-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white rounded-xl transition-all flex items-center justify-center cursor-pointer group"
          title="Ir para o topo"
        >
          <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Underline Sub-block */}
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-600">
        <span>&copy; {new Date().getFullYear()} Portal do Cidadão - Leme. Todos os direitos reservados.</span>
        <span>Código Aberto para Replicação Municipal</span>
      </div>
    </footer>
  );
}
