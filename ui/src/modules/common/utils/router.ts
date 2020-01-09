import queryString from 'query-string';
import { router } from '.';

/**
 * @param {Object} query
 */
const setParams = (history: any, query: any, replace: boolean = false) => {
  const location = Object.assign({}, history.location);

  // convert to {param1: value1}
  const parsed = queryString.parse(location.search);

  // add new params or replace old params
  Object.assign(parsed, query);

  // convert back to param1=value1&param2=value2
  const stringified = queryString.stringify(parsed);

  // go to new url
  if (replace) {
    return history.replace(
      `${location.pathname}?${stringified}${location.hash}`
    );
  }

  return history.push(`${location.pathname}?${stringified}${location.hash}`);
};

/**
 * @param {String} name
 */
const getParam = (history: any, name: string | string[]) => {
  const location = Object.assign({}, history.location);

  // convert to {param1: value1}
  const parsed = queryString.parse(location.search);

  return parsed[name];
};

/**
 * @param {...String} queryNames
 */
const removeParams = (history: any, ...queryNames: string[]) => {
  const location = Object.assign({}, history.location);

  // convert to {param1: value1}
  const parsed = queryString.parse(location.search);

  // remove given parameters
  queryNames.forEach(q => delete parsed[q]);

  // convert back to param1=value1&param2=value2
  const stringified = queryString.stringify(parsed);

  // go to new url
  history.push(`${location.pathname}?${stringified}`);
};

/*
 * @param {Object} query
 */
const refetchIfUpdated = (history: any, query: any) => {
  if (history.location.search.includes('updated')) {
    // refetch query if path has refetch param
    query.refetch();

    // clear refetch param
    removeParams(history, 'updated');
  }
};

/**
 * Replace specific param
 * @param {Object} history
 * @param {Object} params - Updated params
 * @query {Object} query
 */
const replaceParam = (history: any, params: any, query: any) => {
  Object.assign(params, query);

  const stringified = queryString.stringify(params);

  return history.push(`${window.location.pathname}?${stringified}`);
};

export const generatePaginationParams = (queryParams: {
  page?: string;
  perPage?: string;
}) => {
  return {
    page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
    perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 20
  };
};

/**
 * Set selected option param
 * @param {String} selected values
 * @param {String} param name
 * @param {Object}  history
 */
const onParamSelect = (
  name: string,
  values: string[] | string,
  history: any
) => {
  router.setParams(history, { [name]: values });
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
const removeHash = (history: any, hashKey?: string) => {
  const location = Object.assign({}, history.location);

  // convert to {hashKey: value}
  const parsedHash = queryString.parse(location.hash);

  // remove given hashKey
  delete parsedHash[hashKey];

  // convert back to hashKey=value
  const stringified = queryString.stringify(parsedHash);

  history.push(`${location.pathname}?${stringified}`);
};

export default {
  onParamSelect,
  setParams,
  getParam,
  replaceParam,
  removeParams,
  removeHash,
  refetchIfUpdated,
  checkHashKeyInURL
};
