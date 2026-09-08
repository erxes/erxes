export const pager = ({
  page,
  perPage,
}: {
  page?: number;
  perPage?: number;
}) => {
  const limit = perPage || 20;

  return {
    limit,
    skip: ((page || 1) - 1) * limit,
  };
};
