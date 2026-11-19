const NUMBER_WIDTH = 8;
const NARROW_NUMBER_WIDTH = 6;
const MIN_VALUES_WIDTH = 40;
const MAX_VALUES_WIDTH = 74;
const VALUE_COLUMN_WIDTH = 12;
const WIDE_REPORT_COLUMNS = 4;

export interface ReportColumnWidths {
  number: number;
  name: number;
  value: number;
}

export const reportColumnWidths = (columnCount: number): ReportColumnWidths => {
  if (columnCount <= 0)
    return { number: NUMBER_WIDTH, name: 100 - NUMBER_WIDTH, value: 0 };
  const number =
    columnCount > WIDE_REPORT_COLUMNS ? NARROW_NUMBER_WIDTH : NUMBER_WIDTH;
  const values = Math.min(
    Math.max(MIN_VALUES_WIDTH, columnCount * VALUE_COLUMN_WIDTH),
    MAX_VALUES_WIDTH,
  );
  return { number, name: 100 - number - values, value: values / columnCount };
};
