import { getEnv } from 'erxes-api-shared/utils';
import * as graph from 'fbgraph';

export const graphRequest = {
  base(method: string, path?: any, accessToken?: any, ...otherParams) {
    // Load testing has to stop before Meta: pointing this at a local stand-in
    // exercises the outbox, pacing and breaker without a page paying for it.
    const graphUrl = getEnv({ name: 'FACEBOOK_GRAPH_URL', defaultValue: '' });

    if (graphUrl) {
      graph.setGraphUrl(graphUrl);
    }

    // set access token
    graph.setAccessToken(accessToken);
    graph.setVersion('7.0');

    return new Promise((resolve, reject) => {
      graph[method](path, ...otherParams, (error, response) => {
        if (error) {
          return reject(error);
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

  delete(...args): any {
    return this.base('del', ...args);
  },
};

export const getPageAccessTokenFromMap = (
  pageId: string,
  pageTokens: { [key: string]: string },
): string => {
  return pageTokens?.[pageId];
};
