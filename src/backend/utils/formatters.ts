/**
 * Formata um número para o padrão brasileiro com uso de separador de milhares.
 * Retorna 'N/A' caso não seja um número finito válido.
 * 
 * @param num O número a ser formatado.
 */
export const formatNumber = (num: number) => {
  if (isNaN(num) || !isFinite(num)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(num);
};

/**
 * Formata coeficientes dos modelos matemáticos, usando porcentagem
 * para a taxa 'i', e evitando notação científica se o número couber na tela.
 */
export const formatCoefficient = (key: string, val: number, isCompact: boolean = false) => {
  if (key.toLowerCase() === 'i') {
    return `${(val * 100).toFixed(isCompact ? 1 : 2)}%`;
  }
  
  if (isNaN(val) || !isFinite(val)) return 'N/A';
  
  const absVal = Math.abs(val);
  if (absVal === 0) return '0';
  
  if (key === 'Ps' || key === 'P0') {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(val);
  }
  
  const scientificCutoff = 0.0001;
  const expDigits = isCompact ? 2 : 4;
  const sigDigits = isCompact ? 4 : 5;
  
  if (absVal < scientificCutoff || absVal >= 999999) {
    return val.toExponential(expDigits);
  }
  
  return parseFloat(val.toPrecision(sigDigits)).toString();
};
