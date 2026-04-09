import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { ProjectionResult } from '../models/ProjectionTypes';
import { formatNumber } from '../utils/formatters';

/**
 * Utilitários para exportação de relatórios (PDF e Excel).
 * Centralizado aqui para desacoplar a interface gráfica da lógica de exportação.
 */

// --- PDF Export ---
export const generatePDF = async (
  t0: number, p0: number,
  t1: number, p1: number,
  t2: number, p2: number,
  targetYear: number,
  results: ProjectionResult[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MEMORIAL DE CÁLCULO', 20, 25);
  doc.setFontSize(10);
  doc.text('MODELAGEM MATEMÁTICA - PROJEÇÃO POPULACIONAL', 20, 33);

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
    headStyles: { fillColor: [47, 158, 65] },
    styles: { fontSize: 9 },
  });

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

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount} - Gerado por Modelagem Matemática App`, pageWidth / 2, 285, { align: 'center' });
  }

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

// --- Excel Export ---
export const exportToExcel = (
  t0: number, p0: number,
  t1: number, p1: number,
  t2: number, p2: number,
  targetYear: number,
  results: ProjectionResult[],
  chartData: any[]
) => {
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
