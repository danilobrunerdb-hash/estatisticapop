import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ArrowLeft, Download, Layers, Ruler, Settings2 } from 'lucide-react';
import { useProjectionContext } from '../../context/ProjectionContext';
import { formatNumber } from '../../../backend/utils/formatters';
import { ProjectionResult } from '../../../backend/models/ProjectionTypes';
import { ProjectionChart } from '../../components/dashboard/ProjectionChart';

export const MethodTab = () => {
  const { results, activeTab, setActiveTab, t0, targetYear, p0 } = useProjectionContext();
  const res = results.find(r => r.id === activeTab);

  if (!res) return null;

  return (
    <div className="p-4 md:p-6 max-w-[1000px] mx-auto min-h-screen space-y-4 md:space-y-6">
      <ProjectionChart singleMethodId={res.id} />

      <section className="relative overflow-hidden p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: res.color }} />
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 ml-3">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Análise Detalhada</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: res.color }} />
              Método {res.method}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 ml-3">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Activity className="w-3.5 h-3.5" /> Passo a Passo da Equação
            </h3>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 md:p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/80 space-y-3">
              {res.calculationSteps.map((step, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <span className="text-slate-300 dark:text-slate-600 font-bold select-none text-xs">{i + 1}.</span>
                  <span className="font-sans text-slate-800 dark:text-slate-300 font-bold tracking-tight text-xs md:text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Settings2 className="w-3.5 h-3.5" /> Parâmetros do Modelo
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(res.coefficients).map(([key, val]) => (
                <div key={key} className="bg-white dark:bg-slate-900 p-4 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 flex flex-col justify-center shadow-sm">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{key}</span>
                  <span className="text-base md:text-lg font-black text-slate-800 dark:text-slate-200 tracking-tighter">{(val as number).toExponential(4)}</span>
                </div>
              ))}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 flex flex-col justify-center shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Pop. P0 ({t0})</span>
                <span className="text-base md:text-lg font-black text-slate-800 dark:text-slate-200 tracking-tighter">{formatNumber(p0)}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 flex flex-col justify-center shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tempo Δt</span>
                <span className="text-base md:text-lg font-black text-slate-800 dark:text-slate-200 tracking-tighter">{targetYear - t0} anos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 ml-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Ruler className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">População Final Calculada</p>
              <p className="text-slate-500 font-medium text-xs">Ano Horizonte: {targetYear}</p>
            </div>
          </div>
          <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            {formatNumber(res.population)} <span className="text-[0.8rem] font-bold text-slate-400 uppercase tracking-widest">hab</span>
          </div>
        </div>
      </section>
    </div>
  );
};
