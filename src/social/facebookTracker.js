import graph from 'fbgraph';

/*
 * Common graph api request wrapper
 * catchs auth token or other type of exceptions
 */
export const graphRequest = {
  base(method, path, accessToken, ...otherParams) {
    // set access token
    graph.setAccessToken(accessToken);

    try {
      // TODO
      return graph[method](otherParams);

      // catch session expired or some other error
    } catch (e) {
      console.log(e.message); // eslint-disable-line no-console
      return e.message;
    }
  },

  get(...args) {
    return this.base('get', ...args);
  },

  post(...args) {
    return this.base('post', ...args);
  },
};
