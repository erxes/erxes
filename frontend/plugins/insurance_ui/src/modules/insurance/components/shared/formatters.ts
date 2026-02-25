export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('mn-MN');
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('mn-MN').format(amount) + '₮';
};
