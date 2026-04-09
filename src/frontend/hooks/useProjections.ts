import { useMemo } from 'react';
import { ProjectionResult, ManualCoefficients } from '../../backend/models/ProjectionTypes';
import { COLORS } from '../../backend/utils/constants';
import { formatNumber } from '../../backend/utils/formatters';

/**
 * Hook customizado para calcular as projeções populacionais e estatísticas.
 * Profissionais separam a Lógica de Negócio (cálculos) da UI (Renderização),
 * facilitando testes e reutilização do código.
 */
export const useProjections = (
  t0: number, p0: number,
  t1: number, p1: number,
  t2: number, p2: number,
  targetYear: number,
  manualCoeffs: ManualCoefficients
) => {

  const results = useMemo(() => {
    const dt = t2 - t0;
    const dt2 = t2 - t1;

    // Função interna para o Erro Quadrático Médio (Root Mean Square Error)
    const calcRMSE = (methodFunc: (t: number) => number) => {
      const e0 = methodFunc(t0) - p0;
      const e1 = methodFunc(t1) - p1;
      const e2 = methodFunc(t2) - p2;
      return Math.sqrt((e0 * e0 + e1 * e1 + e2 * e2) / 3);
    };

    // --- 1. Método Aritmético ---
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

    // --- 2. Método Geométrico ---
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

    // --- 3. Regressão Multiplicativa ---
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

    // --- 4. Método da Taxa Decrescente ---
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

    // --- 5. Método Logístico ---
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

  // --- Estatísticas de Confiabilidade ---
  const stats = useMemo(() => {
    if (!results || results.length === 0) return { reliability: "0", stdDev: 0 };

    const populations = results.map(r => r.population);
    const mean = populations.reduce((a, b) => a + b, 0) / populations.length;
    const variance = populations.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / populations.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean === 0 ? 0 : stdDev / mean;
    const reliability = Math.max(0, Math.min(100, 100 - (cv * 150)));

    return {
      reliability: reliability.toFixed(1),
      stdDev: stdDev
    };
  }, [results]);

  return { results, stats };
};
