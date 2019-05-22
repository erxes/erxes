export const paginate = (collection, params: { page?: number; perPage?: number }) => {
  const { page = 0, perPage = 0 } = params || {};

  const _page = Number(page || '1');
  const _limit = Number(perPage || '20');

  return collection.limit(_limit).skip((_page - 1) * _limit);
};

export const dealsCommonFilter = (filter, { search }: { search?: string }) => {
  return {
    ...filter,
    $or: [{ name: new RegExp(`.*${search || ''}.*`, 'i') }, { description: new RegExp(`.*${search || ''}.*`, 'i') }],
  };
};

/*
 * Converts given value to date or if value in valid date
 * then returns default value
 */
export const fixDate = (value, defaultValue = new Date()): Date => {
  const date = new Date(value);

  if (!isNaN(date.getTime())) {
    return date;
  }

  return defaultValue;
};

export const getDate = (date: Date, day: number): Date => {
  const currentDate = new Date();

  date.setDate(currentDate.getDate() + day + 1);
  date.setHours(0, 0, 0, 0);

  return date;
};

export const nextMonday = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7) + 2);

  return date;
};

export const nextWeekdayDate = (dayInWeek: number): Date => {
  const monday = nextMonday();

  const weekDate = new Date(monday.getTime());

  weekDate.setDate(weekDate.getDate() + ((dayInWeek - 1 - weekDate.getDay() + 7) % 7) + 1);
  weekDate.setHours(0, 0, 0, 0);

  return weekDate;
};

export const getToday = (date: Date): Date => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
};

export const getNextMonth = (date: Date): { start: number; end: number } => {
  const today = getToday(date);

  const month = (new Date().getMonth() + 1) % 12;
  const start = today.setMonth(month, 1);
  const end = today.setMonth(month + 1, 0);

  return { start, end };
};
