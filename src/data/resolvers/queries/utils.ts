export const paginate = (collection, params: { page?: number; perPage?: number }) => {
  const { page = 0, perPage = 0 } = params || {};

  if (!page && !perPage) {
    return collection;
  }

  const _page = Number(page || '1');
  const _limit = Number(perPage || '20');

  return collection.limit(_limit).skip((_page - 1) * _limit);
};
