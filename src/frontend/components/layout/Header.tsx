import React from 'react';
import { Sun, Moon, BookOpen, Layers, Activity, TrendingUp, Sigma } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProjectionContext } from '../../context/ProjectionContext';

export const Header = () => {
  const { isDarkMode, setIsDarkMode, isManualOpen, setIsManualOpen, headerTheme } = useProjectionContext();

  const isGreen = headerTheme === 'green';

  return (
    <header className={`${isGreen ? 'bg-gradient-to-r from-[#0a2e18] via-[#115e34] to-[#1cb061] dark:from-[#03150b] dark:via-[#072b16] dark:to-[#0b4724] border-white/10 dark:border-white/5' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'} border-b px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-6 z-50 relative transition-all duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-none overflow-hidden`}>

      {isGreen && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />}

      <div className="flex items-center gap-4 md:gap-6 relative z-10">
        <div className={`p-2.5 bg-white rounded-xl md:rounded-2xl flex items-center justify-center relative overlow-hidden ${isGreen ? 'shadow-lg border-2 border-white/20' : 'shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-900'}`}>
          <img src="https://www.ifmg.edu.br/portal/centrais-de-conteudos/publicacoes/informativo/183/183_arquivos/logo-1.png" alt="IFMG Logo" className={`h-8 md:h-10 object-contain ${isGreen ? 'drop-shadow-sm' : ''}`} />
        </div>
        <div className="flex flex-col">
          <h1 className={`text-2xl md:text-3xl font-black tracking-tighter leading-none mb-1 ${isGreen ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
            Projeção Populacional
          </h1>
          <span className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isGreen ? 'text-green-100' : 'text-green-600 dark:text-green-400'}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isGreen ? 'bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]' : 'bg-green-500'}`}></span>
            Sistemas de Transportes
          </span>
        </div>
      </div>

      <div className={`flex items-center gap-4 text-xs md:text-sm p-2.5 px-4 rounded-[1.25rem] shadow-sm relative overflow-hidden group z-10 ${isGreen ? 'bg-black/20 backdrop-blur-md border border-white/10 shadow-inner' : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800'}`}>
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${isGreen ? 'via-white/5' : 'via-slate-200/50 dark:via-white/5'}`} />
        <div className="flex flex-col text-right relative z-10">
          <p><span className={`text-[9px] uppercase font-bold tracking-[0.2em] mr-2 ${isGreen ? 'text-emerald-200/70' : 'text-slate-400'}`}>Prof</span> <strong className={`text-xs md:text-sm ${isGreen ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>Fábio Generoso</strong></p>
          <p><span className={`text-[9px] uppercase font-bold tracking-[0.2em] mr-2 ${isGreen ? 'text-emerald-200/70' : 'text-slate-400'}`}>Estudantes</span> <strong className={`text-xs md:text-sm ${isGreen ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>Danilo Bruner, Weberson Valadares</strong></p>
        </div>
        <div className={`w-px h-8 hidden md:block mx-1 ${isGreen ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`} />

        {/* Manual Modal */}
        <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className={`h-10 w-10 rounded-xl transition-colors ${isGreen ? 'text-white bg-white/10 border-white/20 hover:text-emerald-900 hover:bg-white/90 backdrop-blur-sm shadow-sm' : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm'}`}>
              <BookOpen className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#f4f7f5] dark:bg-[#0a0f16] border border-slate-200 dark:border-slate-800 sm:rounded-[2rem] shadow-2xl p-6 md:p-10 scrollbar-thin z-[100]">
            <DialogHeader className="pb-4 mb-4 border-b border-slate-200/50 dark:border-slate-800/50">
              <DialogTitle className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                Manual de Instruções
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-3">
                Entenda a base matemática por trás dos cálculos automatizados para projeção populacional e confiabilidade da amostra.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5" /> Como os cálculos são feitos?
                </h3>
                <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    O programa exige <strong>3 pontos históricos de referência censitária (T0, T1 e T2)</strong>. A partir desses dados, o sistema extrai constantes de crescimento para equiparar 5 equações fenomenológicas diretas aplicadas à engenharia civil:
                  </p>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-5 mt-2 space-y-2">
                    <li><strong>Aritmético:</strong> Simula um acréscimo linear bruto de habitantes por período.</li>
                    <li><strong>Geométrico:</strong> Simula o crescimento como porcentagem escalável (juros simples populacional).</li>
                    <li><strong>Regressão e Taxa Decrescente:</strong> Incorporam curvas não-lineares, sendo que a taxa decrescente prevê limitações geográficas de espaço vital no futuro.</li>
                    <li><strong>Logístico:</strong> Utilizado universalmente como o mais confiável a longo prazo. Ele delimita uma "População de Saturação (Ps)" indicando o momento em que a cidade atinge seu ápice infraestrutural e cessa sua expansão vertiginosa, criando uma "Curva em S".</li>
                  </ul>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-2 font-medium">
                    Essas mesmas equações - calibradas com o contexto do passado - são então alongadas no eixo cartesiano para prospectar os valores populacionais projetados até o final do <strong>Ano Horizonte</strong> especificado.
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="text-2xl font-serif text-emerald-500 italic lowercase leading-none pb-1 select-none">σ</span> O Desvio Padrão
                  </h3>
                  <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 h-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      Ao gerar 5 previsões usando todos os 5 métodos simultaneamente, o software apura a <strong>Média Absoluta</strong> dessas visões.
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3 font-medium">
                      O processo matemático calcula o **Desvio Padrão** (em raiz de variância) para quantificar o quão "voláteis" são esses resultados a partir dessa Média. Ou seja: indica em ± quantos habitantes eles discordam. Diferenças curtas sinalizam coesão.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" /> A Confiabilidade
                  </h3>
                  <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 h-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      Na ciência, nenhuma estimativa adivinha o futuro perfeitamente. A Confiabilidade mostrada pelo programa não reflete exatidão divina, mas sim <strong>o rigor do Consenso (concordância mútua)</strong> entre as fórmulas.
                    </p>
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-bold tracking-tight">Índice(%) = (Desvio Padrão / Média)</p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3 font-medium">
                      Uma porcentagem alta (ex: 95%) significa máxima estabilidade nos cálculos. Já uma porcentagem abaio de 70% acenderá o alerta técnico de que ocorreu uma "aberração logrítmica" nos modelos, forçando reavaliação local.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="icon" className={`h-10 w-10 rounded-xl transition-colors ${isGreen ? 'text-white bg-white/10 border-white/20 hover:text-emerald-900 hover:bg-white/90 backdrop-blur-sm shadow-sm' : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm'}`} onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? <Sun className={`w-5 h-5 ${isGreen ? 'text-yellow-300' : 'text-yellow-500'}`} /> : <Moon className={`w-5 h-5 ${isGreen ? 'text-white' : 'text-slate-400'}`} />}
        </Button>
      </div>
    </header>
  );
};
