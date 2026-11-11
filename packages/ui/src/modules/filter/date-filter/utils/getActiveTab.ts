import { MONTHS } from '../constants/dateTypes';

export const getActiveTab = (date: string) => {
  if (date.includes('half')) {
    return 'halfYear';
  }
  if (date.includes('quarter')) {
    return 'quarter';
  }
  if (MONTHS.some((month) => date.includes(month))) {
    return 'month';
  }
  if (/^\d{4}-y$/.test(date)) {
    return 'year';
  }
  return 'day';
};
