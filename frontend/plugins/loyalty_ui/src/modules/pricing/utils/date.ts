export const formatDateValue = (value?: Date): string | null => {
  if (!value) {
    return null;
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const parseDateValue = (value?: string | null): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
};

export const isDateRangeValid = (
  startDate?: string | null,
  endDate?: string | null,
) => !startDate || !endDate || startDate <= endDate;
