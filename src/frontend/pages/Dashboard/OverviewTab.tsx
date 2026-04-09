import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Activity, BarChart3, Info, Layers, TrendingUp, Ruler, FileText, Settings2 } from 'lucide-react';
import {
  ComposedChart, Area, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useProjectionContext } from '../../context/ProjectionContext';
import { formatNumber, formatCoefficient } from '../../../backend/utils/formatters';

export const OverviewTab = () => {
  const {
    t0, t1, t2, targetYear, p0, p1, p2,
    results, stats, chartData,
    visibleMethods, toggleMethod, setActiveTab,
    isMemorialOpen, setIsMemorialOpen, setIsManualOpen
  } = useProjectionContext();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const filteredPayload = payload.filter((item: any, index: number, self: any[]) =>
        item.value !== undefined && item.value !== null && !isNaN(item.value) &&
        item.name !== 'arithmetic' && item.name !== 'year' &&
        self.findIndex((t: any) => t.name === item.name) === index
      );

      if (filteredPayload.length === 0) return null;

      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl min-w-[180px]">
          <p className="text-green-600 font-bold text-[10px] mb-2 uppercase tracking-widest border-b border-slate-100 pb-1.5">
            Estaca / Ano: {label}
          </p>
          <div className="space-y-2">
            {filteredPayload.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
                  <span className="text-slate-500 text-[9px] uppercase font-bold tracking-tight">{item.name}</span>
                </div>
                <span className="text-slate-900 text-[10px] font-sans font-black tracking-tight">{formatNumber(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4 md:space-y-6">
      {/* Top Banner: Info Panel & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nota Técnica Card */}
        <Card className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:col-span-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-all duration-300 h-full">
          <div className="flex items-start md:items-center gap-4">
            <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0">
              <Info className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">Nota Técnica & Funcionamento</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl font-medium">
                O software estima o crescimento populacional utilizando modelos fenomenológicos de engenharia. Os cálculos são automatizados a partir dos 3 pontos censitários inseridos no painel lateral. Para detalhes sobre as fórmulas e a métrica de confiabilidade, consulte o <button onClick={() => setIsManualOpen(true)} className="text-green-600 dark:text-green-400 font-bold underline decoration-green-500/30 hover:text-green-700 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-green-500/50 rounded-sm">Manual de Instruções</button>.
              </p>
            </div>
          </div>
        </Card>

        {/* Status do Projeto Card */}
        <Card className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none text-slate-800 dark:text-slate-200 flex flex-col justify-center transition-colors">
          <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Status do Levantamento</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold">Confiabilidade</span>
                <span className="text-[10px] font-bold text-green-600 dark:text-green-500">{stats.reliability}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-600 dark:bg-green-500 h-full transition-all duration-1000" style={{ width: `${stats.reliability}%` }} />
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800/50">
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold">Desvio Padrão Geral</span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">± {formatNumber(stats.stdDev)} hab</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bento Grid - Input & Final Média */}
      <div className="flex flex-col space-y-4 md:space-y-6">
        {/* Historical Inputs & Horizon Target */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 group">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Activity className="w-3 h-3 group-hover:text-green-500 transition-colors" /> Estaca Inicial ({t0})</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{formatNumber(p0)}</h3>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 group">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Activity className="w-3 h-3 group-hover:text-green-500 transition-colors" /> Estaca Intermed. ({t1})</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{formatNumber(p1)}</h3>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 group">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Activity className="w-3 h-3 group-hover:text-green-500 transition-colors" /> Estaca Atual ({t2})</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{formatNumber(p2)}</h3>
            </CardContent>
          </Card>

          {/* Highlight Horizon */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-700 border-none shadow-[0_10px_40px_rgba(16,185,129,0.3)] rounded-3xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 relative">
            <div className="absolute -right-4 -bottom-2 opacity-20">
              <Ruler className="w-24 h-24 text-black transform -rotate-12" />
            </div>
            <CardContent className="p-6 relative z-10 w-full h-full flex flex-col justify-center">
              <p className="text-[9px] md:text-[10px] font-black text-green-100 uppercase tracking-widest mb-1">Horizonte de Projeto</p>
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">{targetYear}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Methods Projections & Average */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-3xl overflow-hidden col-span-1 lg:col-span-3">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-green-500" /> Quadro de Resultados</span>
              {/* O Modal Memorial principal já está no TopToolbar, mas mantemos o texto ou botão menor se quiser */}
            </div>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {results.map((res) => (
                    <TableRow key={res.id} onClick={() => setActiveTab(res.id)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800 transition-colors">
                      <TableCell className="py-2.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: res.color }} />
                          <span className="text-[10px] md:text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest leading-none">{res.method}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 px-4 hidden md:table-cell w-1/3">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-none">{res.formula}</span>
                      </TableCell>
                      <TableCell className="py-2.5 px-4 hidden md:table-cell w-full">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Object.entries(res.coefficients).map(([key, val]) => (
                            <span key={key} className="text-[9px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700 whitespace-nowrap">
                              <span className="text-slate-400 dark:text-slate-500">{key}:</span> {formatCoefficient(key, val as number, true)}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 px-4 text-right whitespace-nowrap">
                        <span className="text-sm md:text-base font-black text-slate-900 dark:text-white tracking-tighter">{formatNumber(res.population)} <span className="text-[9px] text-slate-400 font-bold ml-1">HAB</span></span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Master Average Card */}
          <Card className="bg-slate-900 dark:bg-white border border-slate-800 dark:border-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center items-center text-center p-4 group">
            <div className="p-3 bg-slate-800 dark:bg-slate-50 rounded-full mb-3 group-hover:bg-green-600 dark:group-hover:bg-green-600 transition-colors">
              <TrendingUp className="w-5 h-5 text-green-400 dark:text-green-600 group-hover:text-white transition-colors" />
            </div>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">Média ({targetYear})</p>
            <h3 className="text-2xl md:text-3xl font-black text-white dark:text-slate-900 tracking-tighter">
              {formatNumber(results.reduce((acc, r) => acc + r.population, 0) / results.length)}
            </h3>
          </Card>
        </div>
      </div>

      {/* Chart Section */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-3xl p-8 relative overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                <BarChart3 className="w-5 h-5" />
              </div>
              Projeção de população
            </h2>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Análise comparativa de modelos matemáticos</p>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4 justify-start md:justify-end">
            {results.map((res) => (
              <button
                key={res.id}
                onClick={() => toggleMethod(res.id)}
                className={`flex items-center gap-1.5 transition-all duration-300 hover:scale-105 ${visibleMethods[res.id] ? 'opacity-100' : 'opacity-30'}`}
                title={`Clique para ${visibleMethods[res.id] ? 'ocultar' : 'mostrar'} ${res.method}`}
              >
                <div className="w-3 h-1 rounded-full" style={{ backgroundColor: res.color }} />
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{res.method}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-[450px] w-full" id="growth-chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E2E8F0" />
              <XAxis
                dataKey="year"
                type="number"
                domain={['dataMin', 'dataMax']}
                stroke="#94A3B8"
                fontSize={10}
                tickLine={true}
                axisLine={true}
                label={{ value: 'Ano (Estacas)', position: 'insideBottomRight', offset: -5, fontSize: 10, fontWeight: 'bold' }}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={10}
                tickLine={true}
                axisLine={true}
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                label={{ value: 'População (Hab)', angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 'bold' }}
              />
              <Tooltip content={<CustomTooltip />} />

              <Area type="monotone" dataKey="arithmetic" stroke="none" fill="url(#colorPop)" />

              {results.filter(res => visibleMethods[res.id]).map((res) => (
                <Line
                  key={res.id}
                  type="monotone"
                  dataKey={res.id}
                  stroke={res.color}
                  strokeWidth={res.id === 'logistic' ? 3 : 2}
                  dot={false}
                  name={res.method}
                  animationDuration={1500}
                />
              ))}

              <Scatter dataKey="actual" fill="#16a34a" stroke="#fff" strokeWidth={2} name="Levantamento" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
