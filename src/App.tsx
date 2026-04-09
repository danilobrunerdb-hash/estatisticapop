/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Settings2,
  Info,
  RefreshCcw,
  Download,
  Map as MapIcon,
  Construction,
  Ruler,
  Route,
  Activity,
  Layers,
  FileText,
  ChevronRight,
  Menu,
  X,
  GraduationCap,
  Sun,
  Moon,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

// --- Types ---

interface ProjectionResult {
  method: string;
  population: number;
  coefficients: Record<string, number>;
  formula: string;
  calculationSteps: string[];
  color: string;
  id: string;
  rmse: number;
  equation: string;
}

// --- Constants ---

const COLORS = {
  arithmetic: '#3b82f6', // blue-500
  geometric: '#10b981', // emerald-500
  regression: '#f59e0b', // amber-500
  decreasing: '#8b5cf6', // violet-500
  logistic: '#ef4444', // red-500
};

// --- Helper Functions ---

const formatNumber = (num: number) => {
  if (isNaN(num) || !isFinite(num)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(num);
};

export default function App() {
  // --- State ---
  const [t0, setT0] = useState<number>(2015);
  const [p0, setP0] = useState<number>(9753);
  const [t1, setT1] = useState<number>(2020);
  const [p1, setP1] = useState<number>(21230);
  const [t2, setT2] = useState<number>(2025);
  const [p2, setP2] = useState<number>(38508);
  const [targetYear, setTargetYear] = useState<number>(2030);
  const [isMemorialOpen, setIsMemorialOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Method Visibility Filter State
  const [visibleMethods, setVisibleMethods] = useState<Record<string, boolean>>({
    arithmetic: true,
    geometric: true,
    regression: true,
    decreasing: true,
    logistic: true
  });

  const toggleMethod = (id: string) => {
    setVisibleMethods(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MEMORIAL DE CÁLCULO', 20, 25);

    doc.setFontSize(10);
    doc.text('MODELAGEM MATEMÁTICA - PROJEÇÃO POPULACIONAL', 20, 33);

    // Project Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text('Informações do Projeto', 20, 55);
    doc.setLineWidth(0.5);
    doc.line(20, 57, 190, 57);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, 65);
    doc.text(`Horizonte de Projeto: ${targetYear}`, 20, 72);
    doc.text(`População Atual (${t2}): ${formatNumber(p2)} hab`, 20, 79);

    // Historical Data Table
    doc.setFont('helvetica', 'bold');
    doc.text('Levantamento Histórico', 20, 95);

    autoTable(doc, {
      startY: 98,
      head: [['Estaca', 'Ano', 'População (Hab)']],
      body: [
        ['Inicial (t0)', t0.toString(), formatNumber(p0)],
        ['Intermediária (t1)', t1.toString(), formatNumber(p1)],
        ['Atual (t2)', t2.toString(), formatNumber(p2)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
    });

    // Results Table
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFont('helvetica', 'bold');
    doc.text('Resultados das Projeções', 20, finalY + 15);

    const resultsBody = results.map(res => [
      res.method,
      res.formula,
      formatNumber(res.population)
    ]);

    autoTable(doc, {
      startY: finalY + 18,
      head: [['Método', 'Equação Aplicada', `Projeção (${targetYear})`]],
      body: resultsBody,
      theme: 'grid',
      headStyles: { fillColor: [47, 158, 65] }, // IFMG Green
      styles: { fontSize: 9 },
    });

    // Detailed Coefficients
    const finalY2 = (doc as any).lastAutoTable.finalY || 200;
    doc.setFont('helvetica', 'bold');
    doc.text('Coeficientes e Parâmetros', 20, finalY2 + 15);

    const coeffsData = results.map(res => {
      const coeffsStr = Object.entries(res.coefficients)
        .map(([k, v]) => `${k}: ${(v as number).toExponential(4)}`)
        .join(' | ');
      return [res.method, coeffsStr];
    });

    autoTable(doc, {
      startY: finalY2 + 18,
      head: [['Método', 'Parâmetros Calculados']],
      body: coeffsData,
      theme: 'plain',
      styles: { fontSize: 8 },
    });

    // Detailed Calculations
    const finalY3 = (doc as any).lastAutoTable.finalY || 250;
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Detalhamento dos Cálculos', 20, 20);
    doc.setLineWidth(0.5);
    doc.line(20, 22, 190, 22);

    let currentY = 35;
    results.forEach((res) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(res.method.toUpperCase(), 20, currentY);
      currentY += 7;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      res.calculationSteps.forEach((step) => {
        if (currentY > 275) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(`• ${step}`, 25, currentY);
        currentY += 6;
      });
      currentY += 10;
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount} - Gerado por Modelagem Matemática App`, pageWidth / 2, 285, { align: 'center' });
    }
    // Add Chart Diagram
    const chartElement = document.getElementById('growth-chart');
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Gráfico Comparativo de Projeções', 20, 20);
        doc.setLineWidth(0.5);
        doc.line(20, 22, 190, 22);

        const pdfWidth = doc.internal.pageSize.getWidth() - 40;
        const imgProps = doc.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        doc.addImage(imgData, 'PNG', 20, 30, pdfWidth, pdfHeight);
      } catch (error) {
        console.error("Error generating chart for PDF", error);
      }
    }

    doc.save(`Memorial_Calculo_${targetYear}.pdf`);
  };

  // --- Custom Tooltip ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Filter out duplicates, the background Area chart ('arithmetic'), and items without valid values
      const filteredPayload = payload.filter((item: any, index: number, self: any[]) =>
        item.value !== undefined &&
        item.value !== null &&
        !isNaN(item.value) &&
        item.name !== 'arithmetic' && // Hide the duplicate Area chart
        item.name !== 'year' && // Hide year if it accidentally shows up
        self.findIndex(t => t.name === item.name) === index
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
                <span className="text-slate-900 text-[10px] font-sans font-black tracking-tight">
                  {formatNumber(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Manual coefficients (optional)
  const [manualCoeffs, setManualCoeffs] = useState<Record<string, number | null>>({
    ka: null,
    kg: null,
    kd: null,
    kl: null,
    r: null,
    s: null,
  });

  // --- Calculations ---

  const results = useMemo(() => {
    const dt = t2 - t0;
    const dt2 = t2 - t1;

    // Calculate RMSE for each method
    const calcRMSE = (methodFunc: (t: number) => number) => {
      const e0 = methodFunc(t0) - p0;
      const e1 = methodFunc(t1) - p1;
      const e2 = methodFunc(t2) - p2;
      return Math.sqrt((e0 * e0 + e1 * e1 + e2 * e2) / 3);
    };

    // 1. Arithmetic
    const ka = manualCoeffs.ka ?? (p2 - p0) / dt;
    const pArithmetic = p0 + ka * (targetYear - t0);
    const rmseArithmetic = calcRMSE((t) => p0 + ka * (t - t0));
    const eqArithmetic = `Pt = ${formatNumber(p0)} + ${ka.toFixed(4)} * (t - ${t0})`;
    const arithmeticSteps = [
      `Ka = (P2 - P0) / (t2 - t0)`,
      `Ka = (${p2} - ${p0}) / (${t2} - ${t0})`,
      `Ka = ${ka.toFixed(4)}`,
      `Pt = P0 + Ka * (t - t0)`,
      `Pt = ${p0} + ${ka.toFixed(4)} * (${targetYear} - ${t0})`,
      `Pt = ${formatNumber(pArithmetic)} hab`
    ];

    // 2. Geometric
    const kg = manualCoeffs.kg ?? (Math.log(p2) - Math.log(p0)) / dt;
    const i = Math.exp(kg) - 1;
    const pGeometric = p0 * Math.exp(kg * (targetYear - t0));
    const rmseGeometric = calcRMSE((t) => p0 * Math.exp(kg * (t - t0)));
    const eqGeometric = `Pt = ${formatNumber(p0)} * e^(${kg.toFixed(6)} * (t - ${t0}))`;
    const geometricSteps = [
      `Kg = (ln(P2) - ln(P0)) / (t2 - t0)`,
      `Kg = (ln(${p2}) - ln(${p0})) / (${t2} - ${t0})`,
      `Kg = ${kg.toFixed(6)}`,
      `i = e^Kg - 1 = ${(i * 100).toFixed(4)}% ao ano`,
      `Pt = P0 * e^(Kg * (t - t0))`,
      `Pt = ${p0} * e^(${kg.toFixed(6)} * (${targetYear} - ${t0}))`,
      `Pt = ${formatNumber(pGeometric)} hab`
    ];

    // 3. Multiplicative Regression (P = P0 + r*(t-t0)^s)
    let r = manualCoeffs.r ?? 0;
    let s = manualCoeffs.s ?? 1;
    if (manualCoeffs.r === null || manualCoeffs.s === null) {
      if (p1 > p0 && p2 > p0 && t1 > t0 && t2 > t0) {
        s = (Math.log(p2 - p0) - Math.log(p1 - p0)) / (Math.log(t2 - t0) - Math.log(t1 - t0));
        r = (p1 - p0) / Math.pow(t1 - t0, s);
      }
    }
    const pRegression = p0 + r * Math.pow(targetYear - t0, s);
    const rmseRegression = calcRMSE((t) => p0 + r * Math.pow(t - t0, s));
    const eqRegression = `Pt = ${formatNumber(p0)} + ${r.toFixed(6)} * (t - ${t0})^${s.toFixed(4)}`;
    const regressionSteps = [
      `s = [ln(P2-P0) - ln(P1-P0)] / [ln(t2-t0) - ln(t1-t0)]`,
      `s = [ln(${p2}-${p0}) - ln(${p1}-${p0})] / [ln(${t2}-${t0}) - ln(${t1}-${t0})]`,
      `s = ${s.toFixed(6)}`,
      `r = (P1 - P0) / (t1 - t0)^s`,
      `r = (${p1} - ${p0}) / (${t1} - ${t0})^${s.toFixed(4)}`,
      `r = ${r.toFixed(6)}`,
      `Pt = P0 + r * (t - t0)^s`,
      `Pt = ${p0} + ${r.toFixed(6)} * (${targetYear} - ${t0})^${s.toFixed(6)}`,
      `Pt = ${formatNumber(pRegression)} hab`
    ];

    // 4. Decreasing Growth Rate
    const psDenom = p0 * p2 - p1 * p1;
    const ps = psDenom !== 0 ? (2 * p0 * p1 * p2 - p1 * p1 * (p0 + p2)) / psDenom : p2 * 2;
    const kd = manualCoeffs.kd ?? (ps > p2 && ps > p0 ? -Math.log((ps - p2) / (ps - p0)) / dt : 0);
    const pDecreasing = p0 + (ps - p0) * (1 - Math.exp(-kd * (targetYear - t0)));
    const rmseDecreasing = calcRMSE((t) => p0 + (ps - p0) * (1 - Math.exp(-kd * (t - t0))));
    const eqDecreasing = `Pt = ${formatNumber(p0)} + (${formatNumber(ps)} - ${formatNumber(p0)}) * (1 - e^(-${kd.toFixed(6)} * (t - ${t0})))`;
    const decreasingSteps = [
      `Ps = [2*P0*P1*P2 - P1²*(P0+P2)] / [P0*P2 - P1²]`,
      `Ps = ${formatNumber(ps)} hab (População de Saturação)`,
      `Kd = -ln[(Ps - P2) / (Ps - P0)] / (t2 - t0)`,
      `Kd = ${kd.toFixed(6)}`,
      `Pt = P0 + (Ps - P0) * [1 - e^(-Kd * (t - t0))]`,
      `Pt = ${p0} + (${formatNumber(ps)} - ${p0}) * [1 - e^(-${kd.toFixed(6)} * (${targetYear} - ${t0}))]`,
      `Pt = ${formatNumber(pDecreasing)} hab`
    ];

    // 5. Logistic Growth
    const c = p0 !== 0 ? (ps - p0) / p0 : 1;
    const kl = manualCoeffs.kl ?? (ps > p1 && ps > p0 && p1 !== 0 && dt2 !== 0 ? (1 / dt2) * Math.log((p0 * (ps - p1)) / (p1 * (ps - p0))) : 0);
    const pLogistic = ps / (1 + c * Math.exp(kl * (targetYear - t0)));
    const rmseLogistic = calcRMSE((t) => ps / (1 + c * Math.exp(kl * (t - t0))));
    const eqLogistic = `Pt = ${formatNumber(ps)} / (1 + ${c.toFixed(6)} * e^(${kl.toFixed(6)} * (t - ${t0})))`;
    const logisticSteps = [
      `Ps = ${formatNumber(ps)} hab`,
      `c = (Ps - P0) / P0 = ${c.toFixed(6)}`,
      `Kl = [1 / (t2 - t1)] * ln[(P0 * (Ps - P1)) / (P1 * (Ps - p0))]`,
      `Kl = ${kl.toFixed(6)}`,
      `Pt = Ps / [1 + c * e^(Kl * (t - t0))]`,
      `Pt = ${formatNumber(ps)} / [1 + ${c.toFixed(6)} * e^(${kl.toFixed(6)} * (${targetYear} - ${t0}))]`,
      `Pt = ${formatNumber(pLogistic)} hab`
    ];

    return [
      {
        method: 'Aritmético',
        population: pArithmetic,
        coefficients: { Ka: ka },
        formula: 'Pt = P0 + Ka(t - t0)',
        calculationSteps: arithmeticSteps,
        color: COLORS.arithmetic,
        id: 'arithmetic',
        rmse: rmseArithmetic,
        equation: eqArithmetic
      },
      {
        method: 'Geométrico',
        population: pGeometric,
        coefficients: { Kg: kg, i: i },
        formula: 'Pt = P0 * e^(Kg(t - t0))',
        calculationSteps: geometricSteps,
        color: COLORS.geometric,
        id: 'geometric',
        rmse: rmseGeometric,
        equation: eqGeometric
      },
      {
        method: 'Regressão',
        population: pRegression,
        coefficients: { r, s },
        formula: 'Pt = P0 + r(t - t0)^s',
        calculationSteps: regressionSteps,
        color: COLORS.regression,
        id: 'regression',
        rmse: rmseRegression,
        equation: eqRegression
      },
      {
        method: 'Taxa Decr.',
        population: pDecreasing,
        coefficients: { Ps: ps, Kd: kd },
        formula: 'Pt = P0 + (Ps - P0)(1 - e^(-Kd(t - t0)))',
        calculationSteps: decreasingSteps,
        color: COLORS.decreasing,
        id: 'decreasing',
        rmse: rmseDecreasing,
        equation: eqDecreasing
      },
      {
        method: 'Logístico',
        population: pLogistic,
        coefficients: { Ps: ps, c, Kl: kl },
        formula: 'Pt = Ps / (1 + c * e^(Kl(t - t0)))',
        calculationSteps: logisticSteps,
        color: COLORS.logistic,
        id: 'logistic',
        rmse: rmseLogistic,
        equation: eqLogistic
      },
    ] as ProjectionResult[];
  }, [t0, p0, t1, p1, t2, p2, targetYear, manualCoeffs]);

  // --- Statistics ---
  const stats = useMemo(() => {
    if (!results || results.length === 0) return { reliability: 0, stdDev: 0 };

    const populations = results.map(r => r.population);
    const mean = populations.reduce((a, b) => a + b, 0) / populations.length;

    // Standard Deviation (Population)
    const variance = populations.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / populations.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of Variation (CV)
    const cv = mean === 0 ? 0 : stdDev / mean;

    // Reliability heuristic (0 to 100%)
    // If CV is 0 (all models agree perfectly), reliability is 100%
    // If CV is 0.5 (models vary by 50% of mean), reliability drops significantly
    // We use a factor of 150 to scale the penalty (e.g., CV of 10% -> 85% reliability)
    const reliability = Math.max(0, Math.min(100, 100 - (cv * 150)));

    return {
      reliability: reliability.toFixed(1),
      stdDev: stdDev
    };
  }, [results]);

  // --- Chart Data ---

  const chartData = useMemo(() => {
    const years = new Set<number>();
    const startYear = Math.min(t0, t1, t2);
    const endYear = targetYear;

    // Add key years
    years.add(t0);
    years.add(t1);
    years.add(t2);
    years.add(endYear);

    // Add intermediate years for smooth curves
    const range = endYear - startYear;
    const step = Math.max(1, Math.floor(range / 30));
    for (let y = startYear; y <= endYear; y += step) {
      years.add(y);
    }

    const sortedYears = Array.from(years).sort((a, b) => a - b);

    return sortedYears.map(y => {
      const point: any = { year: y };
      const dt = t2 - t0;
      const dt2 = t2 - t1;

      // Arithmetic
      const ka = manualCoeffs.ka ?? (p2 - p0) / dt;
      point.arithmetic = p0 + ka * (y - t0);

      // Geometric
      const kg = manualCoeffs.kg ?? (Math.log(p2) - Math.log(p0)) / dt;
      point.geometric = p0 * Math.exp(kg * (y - t0));

      // Regression
      let r = manualCoeffs.r ?? 0;
      let s = manualCoeffs.s ?? 1;
      if (manualCoeffs.r === null || manualCoeffs.s === null) {
        if (p1 > p0 && p2 > p0 && t1 > t0 && t2 > t0) {
          s = (Math.log(p2 - p0) - Math.log(p1 - p0)) / (Math.log(t2 - t0) - Math.log(t1 - t0));
          r = (p1 - p0) / Math.pow(t1 - t0, s);
        }
      }
      point.regression = p0 + r * Math.pow(y - t0, s);

      // Decreasing
      const psDenom = p0 * p2 - p1 * p1;
      const ps = psDenom !== 0 ? (2 * p0 * p1 * p2 - p1 * p1 * (p0 + p2)) / psDenom : p2 * 2;
      const kd = manualCoeffs.kd ?? (ps > p2 && ps > p0 ? -Math.log((ps - p2) / (ps - p0)) / dt : 0);
      point.decreasing = p0 + (ps - p0) * (1 - Math.exp(-kd * (y - t0)));

      // Logistic
      const c = p0 !== 0 ? (ps - p0) / p0 : 1;
      const kl = manualCoeffs.kl ?? (ps > p1 && ps > p0 && p1 !== 0 && dt2 !== 0 ? (1 / dt2) * Math.log((p0 * (ps - p1)) / (p1 * (ps - p0))) : 0);
      point.logistic = ps / (1 + c * Math.exp(kl * (y - t0)));

      // Actual points
      if (y === t0) point.actual = p0;
      if (y === t1) point.actual = p1;
      if (y === t2) point.actual = p2;

      return point;
    });
  }, [t0, p0, t1, p1, t2, p2, targetYear, manualCoeffs]);

  const exportToExcel = () => {
    const historicalData = [
      { Estaca: 'Inicial (t0)', Ano: t0, 'População (Hab)': p0 },
      { Estaca: 'Intermediária (t1)', Ano: t1, 'População (Hab)': p1 },
      { Estaca: 'Atual (t2)', Ano: t2, 'População (Hab)': p2 },
    ];

    const projectionsData = results.map(res => {
      const row: any = {
        Método: res.method,
        'Equação Aplicada': res.formula,
        [`Projeção (${targetYear})`]: res.population,
      };
      Object.entries(res.coefficients).forEach(([k, v]) => {
        row[`Coeficiente ${k}`] = v;
      });
      return row;
    });

    const yearlyData = chartData.map((point: any) => ({
      Ano: point.year,
      'Levantamento': point.actual || '',
      'Aritmético': point.arithmetic || '',
      'Geométrico': point.geometric || '',
      'Regressão': point.regression || '',
      'Taxa Decrescente': point.decreasing || '',
      'Logístico': point.logistic || ''
    }));

    const wb = XLSX.utils.book_new();

    const wsHistorical = XLSX.utils.json_to_sheet(historicalData);
    XLSX.utils.book_append_sheet(wb, wsHistorical, "Histórico");

    const wsProjections = XLSX.utils.json_to_sheet(projectionsData);
    XLSX.utils.book_append_sheet(wb, wsProjections, "Projeções");

    const wsYearly = XLSX.utils.json_to_sheet(yearlyData);
    XLSX.utils.book_append_sheet(wb, wsYearly, "Dados Anuais");

    XLSX.writeFile(wb, `Projecao_Populacional_${targetYear}.xlsx`);
  };

  return (
    <div className={cn("min-h-screen flex flex-col font-sans selection:bg-green-200 transition-colors duration-500", isDarkMode ? "dark bg-[#0a0f16] text-slate-100" : "bg-[#f4f7f5] text-slate-900")}>

      {/* App Shell Top Header - Modern styling */}
      <header className="bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-6 z-[60] relative transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.05)] dark:shadow-none">
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#f4f7f5] dark:bg-[#0a0f16] border border-slate-200 dark:border-slate-800 sm:rounded-[2rem] shadow-2xl p-6 md:p-8">
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

      {/* App Toolbar */}
      <div className="bg-white/40 dark:bg-[#0a0f16]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between sticky top-0 z-50 gap-4 transition-colors">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            className="md:hidden p-2 bg-white dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-green-600 shadow-sm border border-slate-200 dark:border-slate-700"
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
            className="flex-1 md:flex-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 shadow-sm rounded-xl h-10 text-[10px] md:text-xs uppercase tracking-widest font-bold"
            onClick={generatePDF}
          >
            <FileText className="w-4 h-4 mr-2" /> MEMORIAL DE CÁLCULO PDF
          </Button>
          {/* Ver Memorial Button - Replacing Excel */}
          <Dialog open={isMemorialOpen} onOpenChange={setIsMemorialOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white font-bold h-10 rounded-xl text-xs uppercase tracking-widest px-6 shadow-lg shadow-green-600/20 flex items-center gap-2">
                <FileText className="w-4 h-4" /> VER MEMORIAL DE CÁLCULO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#f4f7f5] dark:bg-[#0a0f16] border border-slate-200 dark:border-slate-800 sm:rounded-[2rem] shadow-2xl p-6 md:p-8">
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
                    {/* Decorator Line */}
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
                              <code className="text-slate-700 dark:text-slate-300 font-bold tracking-tight">{step}</code>
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
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">População Inicial P0 ({t0})</span>
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

      <div className="flex flex-1 overflow-hidden relative p-0 md:p-6 gap-6">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-md transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar - Floating Bento Panel */}
        <aside className={cn(
          "w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none z-40 absolute md:relative inset-y-0 left-0 transition-transform duration-500 h-full md:rounded-3xl overflow-hidden",
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

          <ScrollArea className="flex-1">
            <div className="p-5 space-y-8">
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
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 shadow-sm transition-colors">
                    <Label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{item.label}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Ano</span>
                        <Input
                          type="number"
                          value={item.year}
                          onChange={(e) => item.setYear(Number(e.target.value))}
                          className="h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium focus:border-green-500 focus:ring-green-500/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Pop. (Hab)</span>
                        <Input
                          type="number"
                          value={item.pop}
                          onChange={(e) => item.setPop(Number(e.target.value))}
                          className="h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium focus:border-green-500 focus:ring-green-500/20"
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
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-900/50 space-y-2 shadow-sm transition-colors">
                  <Label className="text-[10px] text-green-700 dark:text-green-500 font-bold uppercase">Ano de Horizonte</Label>
                  <Input
                    type="number"
                    value={targetYear}
                    onChange={(e) => setTargetYear(Number(e.target.value))}
                    className="h-10 bg-white dark:bg-slate-900 border-green-300 dark:border-green-800 text-green-700 dark:text-green-500 font-bold text-lg focus:border-green-500 focus:ring-green-500/20"
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
                    { key: 'ka', label: 'Ka (Aritm.)' },
                    { key: 'kg', label: 'Kg (Geom.)' },
                    { key: 'kd', label: 'Kd (Decr.)' },
                    { key: 'kl', label: 'Kl (Logist.)' },
                    { key: 'r', label: 'r (Regr.)' },
                    { key: 's', label: 's (Regr.)' },
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
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto blueprint-grid relative transition-colors md:rounded-3xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)] dark:shadow-none bg-white/40 dark:bg-slate-900/20 md:border md:border-slate-200/50 dark:border-slate-800/50">
          {activeTab === 'overview' ? (
            <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4 md:space-y-6">
              {/* Top Banner: Info Panel & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nota Técnica Card */}
                <Card className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:col-span-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-all duration-300 h-full">
                  <div className="flex items-start md:items-center gap-4">
                    <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0">
                      <Info className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Nota Técnica & Funcionamento</h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl font-medium">
                        O software estima o crescimento populacional utilizando modelos fenomenológicos de engenharia. Os cálculos são automatizados a partir dos 3 pontos censitários inseridos no painel lateral. Para detalhes sobre as fórmulas e a métrica de confiabilidade, consulte o <span className="text-green-600 dark:text-green-400 font-bold underline decoration-green-500/30">Manual de Instruções</span> (ícone de livro) localizado no cabeçalho superior.
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
                  {/* Results Table Card */}
                  <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-3xl overflow-hidden col-span-1 lg:col-span-3">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-green-500" /> Quadro de Resultados</span>
                      <Dialog open={isMemorialOpen} onOpenChange={setIsMemorialOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 gap-1.5 px-3 rounded-lg border border-transparent hover:border-green-200 dark:hover:border-green-800 transition-all">
                            <FileText className="w-3 h-3" /> Ver Memorial
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#f4f7f5] dark:bg-[#0a0f16] border border-slate-200 dark:border-slate-800 sm:rounded-[2rem] shadow-2xl p-6 md:p-8">
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
                                {/* Decorator Line */}
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
                                          <span className="text-slate-700 dark:text-slate-300 font-bold tracking-tight">{step}</span>
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
                                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">População Inicial P0 ({t0})</span>
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
                                      <span className="text-slate-400 dark:text-slate-500">{key}:</span> {(val as number).toExponential(2)}
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
          ) : (
            <div className="p-8 max-w-4xl mx-auto space-y-8">
              {(() => {
                const res = results.find(r => r.id === activeTab);
                if (!res) return null;
                return (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-12 rounded-full" style={{ backgroundColor: res.color }} />
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{res.method}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-sans font-bold mt-1 tracking-tight">{res.formula}</p>
                      </div>
                    </div>

                    <Card className="bg-white dark:bg-slate-900 border-none shadow-sm p-6 transition-colors">
                      <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Projeção Gráfica</h3>
                      <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chartData}>
                            <defs>
                              <linearGradient id={`color-${res.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={res.color} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={res.color} stopOpacity={0} />
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
                            <Area type="monotone" dataKey={res.id} stroke="none" fill={`url(#color-${res.id})`} />
                            <Line
                              type="monotone"
                              dataKey={res.id}
                              stroke={res.color}
                              strokeWidth={3}
                              dot={false}
                              name={res.method}
                              animationDuration={1500}
                            />
                            <Scatter dataKey="actual" fill="#16a34a" stroke="#fff" strokeWidth={2} name="Levantamento" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-none shadow-sm p-6 transition-colors">
                      <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Equação da Curva</h3>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <code className="text-slate-900 dark:text-slate-100 font-sans font-bold text-lg tracking-tight">{res.equation}</code>
                      </div>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-none shadow-sm p-6 transition-colors">
                      <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Desenvolvimento do Cálculo</h3>
                      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm space-y-3">
                        {res.calculationSteps.map((step, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <span className="text-slate-400 dark:text-slate-500 font-sans font-bold text-sm mt-0.5">{i + 1}.</span>
                            <code className="text-slate-800 dark:text-slate-200 font-sans font-medium text-sm whitespace-pre-wrap tracking-tight">{step}</code>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-none shadow-sm p-6 transition-colors">
                      <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Parâmetros Aplicados</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(res.coefficients).map(([key, val]) => (
                          <div key={key} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{key}</span>
                            <span className="text-lg font-sans font-bold text-slate-900 dark:text-slate-200">{(val as number).toExponential(5)}</span>
                          </div>
                        ))}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">P0 ({t0})</span>
                          <span className="text-lg font-sans font-bold text-slate-900 dark:text-slate-200">{formatNumber(p0)}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">t - t0</span>
                          <span className="text-lg font-sans font-bold text-slate-900 dark:text-slate-200">{targetYear - t0} anos</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Desvio Padrão (RMSE)</span>
                          <span className="text-lg font-sans font-bold text-slate-900 dark:text-slate-200">± {formatNumber(res.rmse)} hab</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="bg-green-600 border-none shadow-md p-6 text-white flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-green-100 uppercase tracking-widest mb-1">Resultado Final ({targetYear})</p>
                        <h3 className="text-4xl font-black">{formatNumber(res.population)} <span className="text-lg text-green-100 font-normal">habitantes</span></h3>
                      </div>
                      <div className="p-4 rounded-full" style={{ backgroundColor: `rgba(255,255,255,0.2)` }}>
                        <Activity className="w-8 h-8 text-white" />
                      </div>
                    </Card>
                  </div>
                );
              })()}
            </div>
          )}
        </main>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between text-[9px] text-slate-500 uppercase font-bold tracking-widest transition-colors">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> SISTEMA ONLINE</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>COORD: 23°32'S 46°38'W</span>
        </div>
        <div className="flex items-center gap-4">
          <span>ENGINE: V3.2.0</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>USER: {window.location.hostname.split('-')[0].toUpperCase()}</span>
        </div>
      </footer>
    </div>
  );
}
