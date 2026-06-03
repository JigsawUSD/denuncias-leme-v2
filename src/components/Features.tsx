import { motion } from 'motion/react';
import { PencilLine, BarChart3, Radio } from 'lucide-react';

export function Features() {
  const steps = [
    {
      icon: PencilLine,
      stepNum: '01',
      title: 'Registre',
      description:
        'Descreva o problema, anexe uma imagem opcional e passe a localização exata ou aproximada do ocorrido. O preenchimento é simples e rápido.',
      colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      icon: BarChart3,
      stepNum: '02',
      title: 'Compilamos',
      description:
        'Agrupamos as queixas de forma organizada por bairro e tipo, gerando painéis automatizados e relatórios para medir os gargalos da infraestrutura.',
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: Radio,
      stepNum: '03',
      title: 'Cobramos',
      description:
        'Direcionamos as informações triadas à imprensa local, redes sociais e cobramos publicamente as secretarias municipais para obter respostas rápidas.',
      colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 px-4 md:px-8 bg-neutral-950 border-t border-neutral-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">
            Transparência Ativa
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-2 mb-4">
            Como Funciona o Fluxo?
          </h2>
          <p className="text-neutral-400 text-base md:text-lg">
            Um ecossistema transparente feito de cidadão para cidadão, cobrando o que é direito da nossa população.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group relative bg-neutral-900/40 p-8 rounded-2xl border border-neutral-800/80 hover:border-neutral-700/60 transition-all duration-300 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Icon & Step Number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-xl border ${step.colorClass}`}>
                      <Icon className="w-6 h-6 animate-pulse" />
                    </div>
                    <span className="text-4xl font-black text-neutral-800 tracking-tighter select-none">
                      {step.stepNum}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-200">
                    {step.title}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="w-full h-1 bg-gradient-to-r from-transparent via-neutral-800 to-transparent mt-8 group-hover:via-neutral-700 transition-all duration-300" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
