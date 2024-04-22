import queryString from 'query-string';

/**
 * @param {Object} query
 */
const setParams = (
  navigate: any,
  location: any,
  query: any,
  replace: boolean = false,
) => {
  // convert to {param1: value1}
  const parsed = queryString.parse(location.search);

  // add new params or replace old params
  Object.assign(parsed, query);

  // convert back to param1=value1&param2=value2
  const stringified = queryString.stringify(parsed);

  // go to new url
  if (replace) {
    return navigate(`${location.pathname}?${stringified}${location.hash}`, {
      replace: true,
    });
  }

  return navigate(`${location.pathname}?${stringified}${location.hash}`);
};

/**
 * @param {String} name
 */
const getParam = (location: any, name: string | string[]) => {
  // convert to {param1: value1}
  const parsed = queryString.parse(location.search);

  return parsed[name];
};

/**
 * @param {...String} queryNames
 */
const removeParams = (
  navigate: any,
  location: any,
  ...queryNames: string[]
) => {
  // convert to {param1: value1}
  const parsed = queryString.parse(location.search);

  // remove given parameters
  queryNames.forEach((q) => delete parsed[q]);

  // convert back to param1=value1&param2=value2
  const stringified = queryString.stringify(parsed);

  // go to new url
  navigate(`${location.pathname}?${stringified}`);
};

/*
 * @param {Object} query
 */
const refetchIfUpdated = ( navigate: any, location: any, query: any) => {
  if (location.search.includes('updated')) {
    // refetch query if path has refetch param
    query.refetch();

    // clear refetch param
    removeParams(navigate,location, 'updated');
  }
};

/**
 * Replace specific param
 * @param {Object} history
 * @param {Object} params - Updated params
 * @query {Object} query
 */
const replaceParam = (navigate: any, params: any, query: any) => {
  Object.assign(params, query);

  const stringified = queryString.stringify(params);

  return navigate(`${window.location.pathname}?${stringified}`);
};

export const generatePaginationParams = (queryParams: {
  page?: string;
  perPage?: string;
}) => {
  return {
    page:
      Object.keys(queryParams || {}).length > 0
        ? queryParams.page
          ? parseInt(queryParams.page, 10)
          : 1
        : 1,
    perPage:
      Object.keys(queryParams || {}).length > 0
        ? queryParams.perPage
          ? parseInt(queryParams.perPage, 10)
          : 20
        : 20,
  };
};

/**
 * Set selected option param
 * @param {String} selected values
 * @param {String} param name
 * @param {Object}  history
 */
const onParamSelect = (
  navigate: any,
  location: any,
  name: string,
  values: string[] | string,
) => {
  setParams(navigate, location, { [name]: values });
};

/**
 * Get hash from URL and check
 * given key exists in hash
 * @param {Object} history - location
 * @returns {Boolean} hashKey
 */
const checkHashKeyInURL = ({ location }, hashKey?: string): boolean => {
  if (!hashKey) {
    return false;
  }

  const parsedHash = queryString.parse(location.hash);

  return hashKey in parsedHash;
};

/**
 * Remove selected hash from URL
 * @param {Object} history - location
 * @param {String} hashKey
 */
const removeHash = (navigate: any,location: any, hashKey?: string) => {
  // convert to {hashKey: value}
  const parsedHash = queryString.parse(location.hash);

  // remove given hashKey
  delete parsedHash[hashKey];

  // convert back to hashKey=value
  const stringified = queryString.stringify(parsedHash);

  navigate(`${location.pathname}?${stringified}`);
};

export {
  onParamSelect,
  setParams,
  getParam,
  replaceParam,
  removeParams,
  removeHash,
  refetchIfUpdated,
  checkHashKeyInURL,
};
