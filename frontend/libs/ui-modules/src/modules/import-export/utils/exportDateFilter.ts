export type ExportDateOperator = 'greaterThan' | 'lessThan';

export const getLocalDayExportBounds = (
  date: Date,
  operator: ExportDateOperator,
): { from?: string; to?: string } => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (operator === 'lessThan') {
    return { to: start.toISOString() };
  }

  return {
    from: new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + 1,
    ).toISOString(),
  };
};
