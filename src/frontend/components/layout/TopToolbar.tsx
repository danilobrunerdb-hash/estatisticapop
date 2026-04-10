import React from 'react';
import { Menu, X, FileText, Info, Layers, Activity, Settings2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useProjectionContext } from '../../context/ProjectionContext';
import { formatNumber } from '../../../backend/utils/formatters';

export const TopToolbar = () => {
  const {
    isSidebarOpen, setIsSidebarOpen,
    activeTab, setActiveTab,
    results, generatePDF, isMemorialOpen, setIsMemorialOpen,
    t0, targetYear, p0
  } = useProjectionContext();

  return (
    <div className="bg-white/40 dark:bg-[#0a0f16]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between sticky top-0 z-50 gap-4 transition-colors">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          className="hidden max-md:block landscape:max-[1200px]:block p-2 bg-white dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-green-600 shadow-sm border border-slate-200 dark:border-slate-700"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn("text-xs font-bold px-4 py-2 rounded-xl transition-all uppercase tracking-widest whitespace-nowrap", activeTab === 'overview' ? "bg-green-600 text-white shadow-lg shadow-green-600/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 shadow-sm border border-slate-200 dark:border-slate-700")}
          >
            VISÃO GERAL
          </button>
          {results.map((res) => (
            <button
              key={res.id}
              onClick={() => setActiveTab(res.id)}
              className={cn("text-[10px] md:text-xs font-bold px-4 py-2 rounded-xl transition-all uppercase tracking-widest whitespace-nowrap", activeTab === res.id ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-lg" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 shadow-sm border border-slate-200 dark:border-slate-700")}
            >
              {res.method}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <Button
          variant="outline"
          className="flex-1 md:flex-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 shadow-sm rounded-xl h-10 text-[10px] md:text-xs uppercase tracking-widest font-bold flex items-center gap-2"
          onClick={generatePDF}
        >
          <Download className="w-4 h-4" /> MEMORIAL PDF
        </Button>

        {/* Memorial Modal */}
        <Dialog open={isMemorialOpen} onOpenChange={setIsMemorialOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white font-bold h-10 rounded-xl text-xs uppercase tracking-widest px-6 shadow-lg shadow-green-600/20 flex items-center gap-2">
              <FileText className="w-4 h-4" /> VER MEMORIAL
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto bg-[#f4f7f5] dark:bg-[#0a0f16] border border-slate-200 dark:border-slate-800 sm:rounded-[2rem] shadow-2xl p-6 md:p-10 scrollbar-thin">
            <DialogHeader className="pb-4 mb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <DialogTitle className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                    <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-2xl text-green-600 dark:text-green-400">
                      <FileText className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    Memorial de Cálculo
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-3 max-w-2xl">
                    Detalhamento matemático da modelagem projetada para o horizonte. Todos os parâmetros foram inferidos a partir dos dados do levantamento histórico.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 md:space-y-8 mt-4">
              {results.map((res) => (
                <section key={res.id} className="relative overflow-hidden p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm transition-all">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-900 dark:bg-white/20" />

                  <div className="flex items-center gap-3 mb-6 ml-2">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{res.method}</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 ml-2">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5" /> Desenvolvimento da Equação
                      </p>
                      <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/80 space-y-3 font-sans text-[10px] md:text-xs">
                        {res.calculationSteps.map((step, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <span className="text-slate-400 dark:text-slate-600 font-bold w-4 mt-0.5 select-none">{i + 1}.</span>
                            <span className="font-sans text-slate-700 dark:text-slate-300 font-bold tracking-tight">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Settings2 className="w-3.5 h-3.5" /> Variáveis da Modelagem
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(res.coefficients).map(([key, val]) => (
                          <div key={key} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-[1.25rem] border border-slate-100 dark:border-slate-800/80 flex flex-col justify-center transition-colors hover:border-green-200 dark:hover:border-green-900">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{key}</span>
                            <span className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tighter">{(val as number).toExponential(4)}</span>
                          </div>
                        ))}
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-[1.25rem] border border-slate-100 dark:border-slate-800/80 flex flex-col justify-center transition-colors hover:border-green-200 dark:hover:border-green-900">
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Pop. Inicial P0 ({t0})</span>
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tighter">{formatNumber(p0)}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-[1.25rem] border border-slate-100 dark:border-slate-800/80 flex flex-col justify-center transition-colors hover:border-green-200 dark:hover:border-green-900">
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Tempo Δt ({targetYear} - {t0})</span>
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tighter">{targetYear - t0} anos</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3 ml-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resultado Projetado • {targetYear}</span>
                    <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {formatNumber(res.population)} <span className="text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">hab</span>
                    </span>
                  </div>
                </section>
              ))}

              <section className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative mt-4">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 dark:bg-white rounded-2xl">
                      <Info className="w-6 h-6 text-white dark:text-slate-900" />
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xl md:text-2xl">Recomendações Técnicas</h3>
                  </div>
                  <ul className="text-sm md:text-base text-slate-600 dark:text-slate-300 space-y-4 font-medium max-w-4xl">
                    <li className="flex gap-4 items-start"><div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white shrink-0" /><span className="leading-relaxed"><strong className="text-slate-900 dark:text-white font-bold tracking-tight">Método Aritmético:</strong> Assume crescimento linear constante. Mais indicado para áreas urbanas já consolidadas e consolidadas sem grande especulação imobiliária.</span></li>
                    <li className="flex gap-4 items-start"><div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white shrink-0" /><span className="leading-relaxed"><strong className="text-slate-900 dark:text-white font-bold tracking-tight">Método Geométrico:</strong> Taxa de crescimento percentual constante. Apropriado para cidades em momento explícito de expansão territorial rápida.</span></li>
                    <li className="flex gap-4 items-start"><div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white shrink-0" /><span className="leading-relaxed"><strong className="text-slate-900 dark:text-white font-bold tracking-tight">Método de Regressão:</strong> Ajuste estatístico avançado de curva (ex: polinomial), capaz de capturar tendências não lineares complexas em dados históricos.</span></li>
                    <li className="flex gap-4 items-start"><div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white shrink-0" /><span className="leading-relaxed"><strong className="text-slate-900 dark:text-white font-bold tracking-tight">Taxa Decrescente:</strong> Considera que a taxa de crescimento diminui à medida que a população se aproxima do limite de saturação físico da região.</span></li>
                    <li className="flex gap-4 items-start"><div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white shrink-0" /><span className="leading-relaxed"><strong className="text-slate-900 dark:text-white font-bold tracking-tight">Método Logístico:</strong> O modelo mais robusto para projeções de infraestrutura de longo prazo, ponderando limites físicos e socioeconômicos de saturação irreversível.</span></li>
                  </ul>
                </div>
              </section>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
