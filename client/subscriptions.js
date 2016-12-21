import { print } from 'graphql-tag/printer';

const addGraphQLSubscriptions = (networkInterface, wsClient) =>
  Object.assign(
    networkInterface,
    {
      subscribe: (request, handler) => wsClient.subscribe({
        query: print(request.query),
        variables: request.variables,
      }, handler),

      unsubscribe: (id) => {
        wsClient.unsubscribe(id);
      },
    }
  );

export default addGraphQLSubscriptions;
