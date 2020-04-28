import queryString from 'query-string';

export const generatePaginationParams = (queryParams: {
  page?: string;
  perPage?: string;
}) => {
  return {
    page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
    perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 20
  };
};

const checkHashKeyInURL = ({ location }, hashKey?: string): boolean => {
  if (!hashKey) {
    return false;
  }

  const parsedHash = queryString.parse(location.hash);

  return hashKey in parsedHash;
};

export default {
  checkHashKeyInURL
};
