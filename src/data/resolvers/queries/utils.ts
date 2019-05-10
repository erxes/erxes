export const paginate = (collection, params: { page?: number; perPage?: number }) => {
  const { page = 0, perPage = 0 } = params || {};

  if (!page && !perPage) {
    return collection;
  }

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
