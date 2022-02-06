/**
 * Link implementation based on: https://github.com/enisdenjo/graphql-ws#user-content-apollo-client
 */

import { Client, ClientOptions, createClient } from 'graphql-ws';
import { print } from 'graphql';
import { ApolloLink, FetchResult, Observable, Operation } from 'apollo-link';

export default class WebSocketLink extends ApolloLink {
  private client: Client;

  constructor(options: ClientOptions) {
    super();
    this.client = createClient(options);
  }

  public request(operation: Operation): Observable<FetchResult> {
    return new Observable(sink => {
      return this.client.subscribe<FetchResult>(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: err => {
            if (Array.isArray(err))
              // GraphQLError[]
              return sink.error(
                new Error(err.map(({ message }) => message).join(', '))
              );

            if (err instanceof CloseEvent)
              return sink.error(
                new Error(
                  `Socket closed with event ${err.code} ${err.reason || ''}` // reason will be available on clean closes only
                )
              );

            return sink.error(err);
          }
        }
      );
    });
  }
}
