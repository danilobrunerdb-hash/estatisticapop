import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ManualCoefficients, ProjectionResult } from '../../backend/models/ProjectionTypes';
import { useProjections } from '../hooks/useProjections';
import { useChartData } from '../hooks/useChartData';
import { generatePDF as generatePDFReport, exportToExcel as generateExcelReport } from '../../backend/services/ExportService';

interface ProjectionContextData {
  t0: number; setT0: (v: number) => void;
  p0: number; setP0: (v: number) => void;
  t1: number; setT1: (v: number) => void;
  p1: number; setP1: (v: number) => void;
  t2: number; setT2: (v: number) => void;
  p2: number; setP2: (v: number) => void;
  targetYear: number; setTargetYear: (v: number) => void;
  
  isMemorialOpen: boolean; setIsMemorialOpen: (v: boolean) => void;
  isManualOpen: boolean; setIsManualOpen: (v: boolean) => void;
  activeTab: string; setActiveTab: (v: string) => void;
  isSidebarOpen: boolean; setIsSidebarOpen: (v: boolean) => void;
  isDarkMode: boolean; setIsDarkMode: (v: boolean) => void;
  
  visibleMethods: Record<string, boolean>;
  toggleMethod: (id: string) => void;
  
  manualCoeffs: ManualCoefficients;
  setManualCoeffs: React.Dispatch<React.SetStateAction<ManualCoefficients>>;
  
  results: ProjectionResult[];
  stats: { reliability: string; stdDev: number };
  chartData: any[];
  
  generatePDF: () => void;
  exportToExcel: () => void;
}

const ProjectionContext = createContext<ProjectionContextData>({} as ProjectionContextData);

export const ProjectionProvider = ({ children }: { children: ReactNode }) => {
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

  const [manualCoeffs, setManualCoeffs] = useState<ManualCoefficients>({
    ka: null, kg: null, kd: null, kl: null, r: null, s: null,
  });

  const { results, stats } = useProjections(t0, p0, t1, p1, t2, p2, targetYear, manualCoeffs);
  const chartData = useChartData(t0, p0, t1, p1, t2, p2, targetYear, manualCoeffs);

  const generatePDF = () => generatePDFReport(t0, p0, t1, p1, t2, p2, targetYear, results);
  const exportToExcel = () => generateExcelReport(t0, p0, t1, p1, t2, p2, targetYear, results, chartData);

  return (
    <ProjectionContext.Provider value={{
      t0, setT0, p0, setP0, t1, setT1, p1, setP1, t2, setT2, p2, setP2, targetYear, setTargetYear,
      isMemorialOpen, setIsMemorialOpen, isManualOpen, setIsManualOpen, activeTab, setActiveTab,
      isSidebarOpen, setIsSidebarOpen, isDarkMode, setIsDarkMode,
      visibleMethods, toggleMethod, manualCoeffs, setManualCoeffs,
      results, stats, chartData, generatePDF, exportToExcel
    }}>
      {children}
    </ProjectionContext.Provider>
  );
};

export const useProjectionContext = () => useContext(ProjectionContext);
