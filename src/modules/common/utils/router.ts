import queryString from 'query-string';

/**
 * @param {Object} query
 */
const setParams = (history: any, query: any) => {
  const location = Object.assign({}, history.location);

  // convert to {param1: value1}
  const parsed = queryString.parse(location.search);

  // add new params or replace old params
  Object.assign(parsed, query);

  // convert back to param1=value1&param2=value2
  const stringified = queryString.stringify(parsed);

  // go to new url
  history.push(`${location.pathname}?${stringified}`);
};

/**
 * @param {String} name
 */
const getParam = (history: any, name: string) => {
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

export default {
  setParams,
  getParam,
  removeParams,
  refetchIfUpdated
};
