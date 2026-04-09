/**
 * Tipos de dados e interfaces para o sistema de Projeção Populacional.
 * Centraliza as definições para garantir consistência em todo o código.
 */

export interface ProjectionResult {
  /** Método de cálculo utilizado (ex: Aritmético, Geométrico) */
  method: string;
  /** População projetada para o ano horizonte */
  population: number;
  /** Coeficientes calculados para a equação atual */
  coefficients: Record<string, number>;
  /** Equação ou fórmula visual no formato de texto curto */
  formula: string;
  /** Passos detalhados do cálculo para o Memorial */
  calculationSteps: string[];
  /** Cor associada ao método (para gráficos e UI) */
  color: string;
  /** Identificador único do método em inglês (ex: 'arithmetic') */
  id: string;
  /** Raiz do erro quadrático médio (Root Mean Square Error) ou desvio do método (uso interno) */
  rmse: number;
  /** String da equação completa com valores substituídos */
  equation: string;
}

export interface ManualCoefficients {
  ka: number | null;
  kg: number | null;
  kd: number | null;
  kl: number | null;
  r: number | null;
  s: number | null;
}

export interface ProjectionStats {
  /** Percentual de confiabilidade (0 a 100) heurística baseada no CV */
  reliability: string;
  /** Desvio padrão entre os resultados dos métodos */
  stdDev: number;
}
