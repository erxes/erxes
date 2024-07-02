export const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'MNT':
      return '₮';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'JPY':
      return '¥';
    case 'CNY':
      return '¥';
    case 'KRW':
      return '₩';
    case 'VND':
      return '₫';
    default:
      return '';
  }
};
