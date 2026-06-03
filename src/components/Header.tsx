import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Landmark, Plus, Settings } from 'lucide-react';

interface HeaderProps {
  onFormNav: () => void;
}

export function Header({ onFormNav }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      // Calculate offset based on header height
      const headerOffset = showBanner ? 128 : 96;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col w-full">
      {/* AVISO CONSTRUÇÃO */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 px-4 py-2 text-xs md:text-sm font-semibold flex items-center justify-between shadow-sm relative overflow-hidden"
          >
            {/* Background animated overlay pattern */}
            <div className="absolute inset-0 bg-stripe opacity-10 pointer-events-none" />
            
            <div className="flex items-center gap-2 mx-auto relative z-10 text-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="inline-flex items-center justify-center text-sm"
              >
                ⚙️
              </motion.span>
              <span>
                <strong>Site em Desenvolvimento Coletivo</strong> — Novo Portal do Cidadão para melhorar cidades e promover engajamento de Leme/SP.
              </span>
            </div>
            
            <button
              onClick={() => setShowBanner(false)}
              className="text-neutral-900 hover:text-neutral-950 p-1 rounded-full hover:bg-white/10 transition-colors absolute right-4 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-1"
              aria-label="Dispensar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN NAV */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 shadow-lg py-3'
            : 'bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-900/50 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('inicio');
            }}
            className="flex items-center gap-3 text-white group"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/20 group-hover:bg-blue-500 transition-colors duration-200">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight leading-none text-white">
                Denúncia Leme
              </span>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase mt-1">
                Portal do Cidadão
              </span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => scrollToSection('inicio')}
              className="text-neutral-300 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="text-neutral-300 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Como Funciona
            </button>
            <button
              onClick={() => scrollToSection('transparencia')}
              className="text-neutral-300 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Transparência
            </button>
            <button
              onClick={() => scrollToSection('sobre-projeto')}
              className="text-neutral-300 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Sobre o Projeto
            </button>
            <button
              onClick={() => scrollToSection('status')}
              className="text-neutral-300 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors mr-2"
            >
              Consultar Protocolo
            </button>
            
            <button
              onClick={() => scrollToSection('denuncia')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              Fazer Denúncia
            </button>
          </div>

          {/* Hamburger toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-neutral-800 text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-expanded={isMenuOpen}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Fullscreen Panel */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden w-full bg-neutral-950 border-t border-neutral-900 py-4 px-6 flex flex-col gap-2 relative z-50"
            >
              <button
                onClick={() => scrollToSection('inicio')}
                className="w-full text-left text-neutral-300 hover:text-white py-3 border-b border-neutral-900 font-medium text-base transition-colors"
              >
                Início
              </button>
              <button
                onClick={() => scrollToSection('como-funciona')}
                className="w-full text-left text-neutral-300 hover:text-white py-3 border-b border-neutral-900 font-medium text-base transition-colors"
              >
                Como Funciona
              </button>
              <button
                onClick={() => scrollToSection('transparencia')}
                className="w-full text-left text-neutral-300 hover:text-white py-3 border-b border-neutral-900 font-medium text-base transition-colors"
              >
                Transparência
              </button>
              <button
                onClick={() => scrollToSection('sobre-projeto')}
                className="w-full text-left text-neutral-300 hover:text-white py-3 border-b border-neutral-900 font-medium text-base transition-colors"
              >
                Sobre o Projeto
              </button>
              <button
                onClick={() => scrollToSection('status')}
                className="w-full text-left text-neutral-300 hover:text-white py-3 border-b border-neutral-900 font-medium text-base transition-colors mb-2"
              >
                Consultar Protocolo
              </button>
              <button
                onClick={() => {
                  scrollToSection('denuncia');
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 text-base"
              >
                <Plus className="w-5 h-5" />
                Fazer Denúncia
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
