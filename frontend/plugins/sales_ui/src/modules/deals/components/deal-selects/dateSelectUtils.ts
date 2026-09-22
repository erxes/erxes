import { format, isValid, parse } from 'date-fns';

const DEAL_DATE_FORMAT = 'yyyy-MM-dd';

export const formatDealDateForMutation = (date?: Date) => {
  if (!date || !isValid(date)) {
    return undefined;
  }

  return format(date, DEAL_DATE_FORMAT);
};

export const parseDealDate = (value?: Date | string) => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return isValid(value) ? value : undefined;
  }

  const dateOnlyValue = value.slice(0, DEAL_DATE_FORMAT.length);
  const parsedDate = parse(dateOnlyValue, DEAL_DATE_FORMAT, new Date());

  if (
    !isValid(parsedDate) ||
    format(parsedDate, DEAL_DATE_FORMAT) !== dateOnlyValue
  ) {
    return undefined;
  }

  return parsedDate;
};
