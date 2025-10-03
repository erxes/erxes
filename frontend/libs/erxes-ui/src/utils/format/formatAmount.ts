export const formatAmount = (amount: number, kind?: 'short' | 'finance') => {
  if (kind === 'short') {
    if (amount < 1000) {
      return amount.toFixed(1).replace(/\.?0+$/, '');
    }
    if (amount < 1000000) {
      return (amount / 1000).toFixed(1).replace(/\.?0+$/, '') + 'k';
    }
    if (amount < 1000000000) {
      return (amount / 1000000).toFixed(1).replace(/\.?0+$/, '') + 'm';
    }
    return (amount / 1000000000).toFixed(1).replace(/\.?0+$/, '') + 'b';
  }

  return Number(amount.toFixed(2)).toLocaleString();

};
