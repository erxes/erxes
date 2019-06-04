import * as graph from 'fbgraph';

export const graphRequest = {
  base(method: string, path?: any, accessToken?: any, ...otherParams) {
    // set access token
    graph.setAccessToken(accessToken);
    graph.setVersion('3.2');

    return new Promise((resolve, reject) => {
      graph[method](path, ...otherParams, (error, response) => {
        if (error) {
          return reject(error.message);
        }

        return resolve(response);
      });
    });
  },
  get(...args): any {
    return this.base('get', ...args);
  },

  post(...args): any {
    return this.base('post', ...args);
  },
};
