import React from 'react';
import { Sun, Moon, BookOpen, Layers, Activity, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProjectionContext } from '../../context/ProjectionContext';

export const Header = () => {
  const { isDarkMode, setIsDarkMode, isManualOpen, setIsManualOpen } = useProjectionContext();

  return (
    <header className="bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-6 z-50 relative transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.05)] dark:shadow-none">
      <div className="flex items-center gap-4 md:gap-6">
        <div className="p-2 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200">
          <img src="https://www.ifmg.edu.br/portal/centrais-de-conteudos/publicacoes/informativo/183/183_arquivos/logo-1.png" alt="IFMG Logo" className="h-8 md:h-10 object-contain" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
            Projeção Populacional
          </h1>
          <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Sistemas de Transportes
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs md:text-sm text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-black/20 p-3 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-sm">
        <div className="flex flex-col text-right">
          <p><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mr-2">Prof</span> <strong className="text-slate-800 dark:text-slate-200 text-sm">Fábio Generoso</strong></p>
          <p><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mr-2">Alunos</span> <strong className="text-slate-800 dark:text-slate-200 text-sm">Danilo Bruner, Weberson V.</strong></p>
        </div>
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden md:block mx-1" />

        {/* Manual Modal */}
        <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 text-slate-500 dark:text-slate-400 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#f4f7f5] dark:bg-[#0a0f16] border border-slate-200 dark:border-slate-800 sm:rounded-[2rem] shadow-2xl p-6 md:p-10 scrollbar-thin z-[100]">
            <DialogHeader className="pb-4 mb-4 border-b border-slate-200/50 dark:border-slate-800/50">
              <DialogTitle className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-400">
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
                    <Activity className="w-5 h-5 text-blue-500" /> O Desvio Padrão
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

        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm" onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
        </Button>
      </div>
    </header>
  );
};
