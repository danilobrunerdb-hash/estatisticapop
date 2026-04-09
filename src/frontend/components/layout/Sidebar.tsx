import React from 'react';
import { Settings2, RefreshCcw, Activity, Ruler, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useProjectionContext } from '../../context/ProjectionContext';

export const Sidebar = () => {
  const {
    isSidebarOpen, setIsSidebarOpen,
    t0, setT0, p0, setP0,
    t1, setT1, p1, setP1,
    t2, setT2, p2, setP2,
    targetYear, setTargetYear,
    manualCoeffs, setManualCoeffs,
    headerTheme, setHeaderTheme
  } = useProjectionContext();

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-md transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Floating Bento Panel */}
      <aside className={cn(
        "w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none z-40 absolute md:relative inset-y-0 left-0 transition-transform duration-500 md:rounded-3xl overflow-hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 transition-colors">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <Settings2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-black uppercase tracking-widest text-sm">Parâmetros</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50" onClick={() => {
            setManualCoeffs({ ka: null, kg: null, kd: null, kl: null, r: null, s: null });
          }}>
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1">
          <div className="p-5 space-y-8 pb-10">
            {/* Historical Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Activity className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Levantamento Histórico</span>
              </div>

              {[
                { label: 'Estaca Inicial (t0)', year: t0, setYear: setT0, pop: p0, setPop: setP0 },
                { label: 'Estaca Interm. (t1)', year: t1, setYear: setT1, pop: p1, setPop: setP1 },
                { label: 'Estaca Atual (t2)', year: t2, setYear: setT2, pop: p2, setPop: setP2 },
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900/80 p-4.5 rounded-[1.25rem] border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-900 dark:group-hover:bg-white transition-colors" />
                  <Label className="text-[10px] text-slate-800 dark:text-slate-300 font-black uppercase tracking-widest ml-2">{item.label}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Ano</span>
                      <Input
                        type="number"
                        value={item.year}
                        onChange={(e) => item.setYear(Number(e.target.value))}
                        className="h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold shadow-inner focus:border-slate-900 dark:focus:border-white focus:ring-slate-900/10 transition-all rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Pop. (Hab)</span>
                      <Input
                        type="number"
                        value={item.pop}
                        onChange={(e) => item.setPop(Number(e.target.value))}
                        className="h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold shadow-inner focus:border-slate-900 dark:focus:border-white focus:ring-slate-900/10 transition-all rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Target Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Ruler className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Projeção de Projeto</span>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-900/20 p-5 rounded-[1.25rem] border border-green-200/60 dark:border-green-800/50 space-y-3 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500" />
                <Label className="text-[10px] text-green-800 dark:text-green-400 font-black uppercase tracking-widest ml-1">Ano de Horizonte</Label>
                <Input
                  type="number"
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="h-12 bg-white dark:bg-slate-900 border-green-300 dark:border-green-700 text-green-700 dark:text-green-500 font-black text-xl md:text-2xl shadow-inner focus:border-green-500 focus:ring-green-500/30 transition-all rounded-xl ml-1 w-[calc(100%-4px)]"
                />
              </div>
            </section>

            {/* Coefficients section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Settings2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Ajuste de Coeficientes</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'ka' as keyof typeof manualCoeffs, label: 'Ka (Aritm.)' },
                  { key: 'kg' as keyof typeof manualCoeffs, label: 'Kg (Geom.)' },
                  { key: 'kd' as keyof typeof manualCoeffs, label: 'Kd (Decr.)' },
                  { key: 'kl' as keyof typeof manualCoeffs, label: 'Kl (Logist.)' },
                  { key: 'r' as keyof typeof manualCoeffs, label: 'r (Regr.)' },
                  { key: 's' as keyof typeof manualCoeffs, label: 's (Regr.)' },
                ].map((item) => (
                  <div key={item.key} className="space-y-1.5">
                    <Label className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase">{item.label}</Label>
                    <Input
                      placeholder="Auto"
                      type="number"
                      value={manualCoeffs[item.key] ?? ''}
                      onChange={(e) => setManualCoeffs(prev => ({ ...prev, [item.key]: e.target.value ? Number(e.target.value) : null }))}
                      className="h-8 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] focus:bg-white dark:focus:bg-slate-900 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Application Theme section */}
            <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Palette className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Tema do Cabeçalho</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setHeaderTheme('gray')}
                  className={cn(
                    "flex-1 text-[10px] uppercase font-bold tracking-widest h-9 rounded-xl border",
                    headerTheme === 'gray' 
                      ? "bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900" 
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  Padrão
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setHeaderTheme('green')}
                  className={cn(
                    "flex-1 text-[10px] uppercase font-bold tracking-widest h-9 rounded-xl border transition-all",
                    headerTheme === 'green'
                      ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-transparent shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-600 hover:border-emerald-200"
                  )}
                >
                  Tema IFMG
                </Button>
              </div>
            </section>
          </div>
        </div>
      </aside>
    </>
  );
};
