export const pagination = () => {
  const hasMore = false;
  const PER_PAGE = 1000;
  const limit = PER_PAGE;

  const loadMore = () => {};

  return {
    limit,
    loadMore,
    hasMore
  };
};
