import { useMemo } from 'react';
import { ManualCoefficients } from '../../backend/models/ProjectionTypes';

/**
 * Hook para gerar os dados consumidos pelo Recharts baseando-se nas estacas e coeficientes.
 */
export const useChartData = (
  t0: number, p0: number,
  t1: number, p1: number,
  t2: number, p2: number,
  targetYear: number,
  manualCoeffs: ManualCoefficients
) => {
  const chartData = useMemo(() => {
    const years = new Set<number>();
    const startYear = Math.min(t0, t1, t2);
    const endYear = targetYear;

    years.add(t0);
    years.add(t1);
    years.add(t2);
    years.add(endYear);

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

      if (y === t0) point.actual = p0;
      if (y === t1) point.actual = p1;
      if (y === t2) point.actual = p2;

      return point;
    });
  }, [t0, p0, t1, p1, t2, p2, targetYear, manualCoeffs]);

  return chartData;
};
