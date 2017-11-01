export const pagination = () => {
  const hasMore = false;
  const PER_PAGE = 20;
  const limit = PER_PAGE;

  const loadMore = () => {};

  return {
    limit,
    loadMore,
    hasMore
  };
};
