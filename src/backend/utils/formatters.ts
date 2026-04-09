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
