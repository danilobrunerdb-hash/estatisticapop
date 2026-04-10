import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import {
  ComposedChart, Area, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useProjectionContext } from '../../context/ProjectionContext';
import { formatNumber } from '../../../backend/utils/formatters';

export const ProjectionChart = ({ singleMethodId }: { singleMethodId?: string }) => {
  const { results, chartData, visibleMethods, toggleMethod } = useProjectionContext();

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

  const activeMethod = singleMethodId ? results.find(r => r.id === singleMethodId) : null;
  const areaColor = activeMethod?.color || '#3b82f6';

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-3xl p-5 md:p-6 relative overflow-hidden transition-colors">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            {singleMethodId && activeMethod ? `Método ${activeMethod.method}` : 'Projeção de população'}
          </h2>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">
            {singleMethodId ? 'Comportamento da curva projetada' : 'Análise comparativa de modelos matemáticos'}
          </p>
        </div>
        {!singleMethodId && (
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
        )}
      </div>

      <div className={singleMethodId ? "h-[320px] w-full" : "h-[450px] w-full"} id={singleMethodId ? undefined : 'growth-chart'}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              {results.map((res) => (
                <linearGradient key={`grad-${res.id}`} id={`color-${res.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={res.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={res.color} stopOpacity={0} />
                </linearGradient>
              ))}
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

            {(singleMethodId === 'logistic' || singleMethodId === 'decreasing') && activeMethod?.coefficients.Ps && (
              <ReferenceLine 
                y={activeMethod.coefficients.Ps} 
                stroke="#0f172a" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ position: 'insideTopLeft', value: 'Pop. Saturação (Ps)', fill: '#0f172a', fontSize: 10, fontWeight: '900' }} 
              />
            )}

            {results
              .filter(res => singleMethodId ? res.id === singleMethodId : visibleMethods[res.id])
              .map((res) => (
                <Area
                  key={res.id}
                  type="monotone"
                  dataKey={res.id}
                  stroke={res.color}
                  strokeWidth={res.id === 'logistic' || singleMethodId ? 3 : 2}
                  fill={`url(#color-${res.id})`}
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
  );
};
