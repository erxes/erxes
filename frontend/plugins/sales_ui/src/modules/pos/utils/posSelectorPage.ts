type PosSelectorPage = {
  page?: number | null;
  perPage?: number | null;
};

// Continues after every row already returned for the original request.
// Missing or non-positive values fall back like the API's paginate helper.
export const getNextPosSelectorPage = (
  { page, perPage }: PosSelectorPage,
  loadedCount: number,
  defaultPerPage: number,
) => {
  const pageSize = perPage && perPage > 0 ? perPage : defaultPerPage;
  const firstPage = page && page > 0 ? page : 1;

  return {
    page: firstPage + Math.ceil(loadedCount / pageSize),
    perPage: pageSize,
  };
};
