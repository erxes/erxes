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


export const getRawAccountNumber = (number: string) => {
  if (number.includes('MN') || number.length === 20) {
    // split account number by 10 return last 10 digits
    return number.slice(-10);
  }
};