/* eslint-disable no-underscore-dangle */

export const paginate = (collection, { page, perPage }) => {
  const _page = Number(page || '1');
  const _limit = Number(perPage || '20');

  return collection.limit(_limit).skip((_page - 1) * _limit);
};
