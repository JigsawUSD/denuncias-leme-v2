import { motion } from 'motion/react';
import { ShieldAlert, Fingerprint, Coins, Scale, Heart, AlertCircle } from 'lucide-react';

export function About() {
  const cards = [
    {
      icon: Heart,
      title: 'Sem fins lucrativos',
      desc: 'Este site foi criado e mantido voluntariamente por cidadãos de Leme, sem qualquer envolvimento financeiro. Nossa vocação é puramente cívica e não coletamos receitas ou taxas de nenhum formato.',
      borderColor: 'border-l-rose-500/80',
    },
    {
      icon: Fingerprint,
      title: 'Apartidário e Neutro',
      desc: 'Não apoiamos, nem temos laços de fidelidade com coligações, pré-candidatos ou vereadores. Este canal serve unicamente ao cidadão de Leme, independente de coloração partidária.',
      borderColor: 'border-l-blue-500/80',
    },
    {
      icon: Coins,
      title: 'Transparência Incorruptível',
      desc: 'Nenhuma queixa será encoberta, abafada ou filtrada para proteger órgãos ou prestadores. O painel expõe as demandas enviadas pelas pessoas reais conforme relatado.',
      borderColor: 'border-l-amber-500/80',
    },
  ];

  return (
    <section id="sobre-projeto" className="py-20 px-4 md:px-8 bg-neutral-950/40 border-t border-neutral-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">
            Sobre o Projeto
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-2 mb-4">
            Quem Somos &amp; Valores
          </h2>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
            Uma plataforma livre concebida para redefinir a governança participativa em Leme/SP, devolvendo o controle da fiscalização urbana aos moradores da cidade.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`bg-neutral-950 p-8 rounded-2xl border border-neutral-900 border-l-4 ${card.borderColor} shadow-lg`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-neutral-900 text-neutral-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{card.title}</h3>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Legal block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-neutral-950 border border-red-500/20 rounded-2xl p-6 md:p-10 shadow-xl overflow-hidden relative"
        >
          {/* Decorative warning banner angle */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-red-600" />

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start relative z-10">
            <div className="p-4 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 shrink-0">
              <ShieldAlert className="w-8 h-8 animate-pulse text-red-500" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                  Princípio Inabalável
                </span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase mb-6">
                TOLERÂNCIA ZERO
              </h3>
              
              <div className="space-y-4 max-w-3xl text-sm md:text-base text-neutral-300 leading-relaxed">
                <p className="border-l-2 border-red-500/40 pl-4 py-0.5">
                  Não toleramos corrupção, suborno, fraude, abuso de poder, desvio de recursos públicos, violência ou qualquer ato que viole a lei.
                </p>
                <p className="border-l-2 border-red-500/40 pl-4 py-0.5">
                  Não vendemos informações.
                </p>
                <p className="border-l-2 border-red-500/40 pl-4 py-0.5">
                  Não aceitamos dinheiro, favores ou vantagens para ocultar fatos, remover denúncias ou proteger infratores.
                </p>
                <p className="border-l-2 border-red-500/40 pl-4 py-0.5">
                  Não passamos pano para crimes, desordem ou irregularidades, independentemente de quem esteja envolvido.
                </p>
                <p className="border-l-2 border-red-500/40 pl-4 py-0.5">
                  Nossa lealdade é com a verdade, a transparência e o interesse da população.
                </p>
                
                <p className="font-extrabold text-red-500 tracking-wider uppercase pt-4 text-xs md:text-sm">
                  Sem privilégios. Sem blindagem. Apenas fatos.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
