export default {
  DOMAIN: 'http://localhost:3000',

  API_GRAPHQL_URL: 'http://localhost:8080/graphql',
  API_WEBSOCKET_URL: 'ws://localhost:3010',

  /**
   * TODO: Only upload handler uses this websocket url.
   * It needs to be removed in the future
   * after upload handler is implemented using GraphQL
   */
  DDP_URL: 'ws://localhost:7010/websocket',
};
