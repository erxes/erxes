/**
 * Link implementation based on: https://github.com/enisdenjo/graphql-ws#user-content-apollo-client
 */

import { Client, ClientOptions, createClient, WebSocket } from 'graphql-ws';
import { print } from 'graphql';
import { ApolloLink, FetchResult, Observable, Operation } from 'apollo-link';

interface RestartableClient extends Client {
  restart(): void;
}

function createRestartableClient(options: ClientOptions): RestartableClient {
  let restartRequested = false;
  let restart = () => {
    restartRequested = true;
  };

  const client = createClient({
    ...options,
    on: {
      ...options.on,
      opened: (socket: any) => {
        options.on?.opened?.(socket);

        restart = () => {
          if (socket.readyState === WebSocket.OPEN) {
            // if the socket is still open for the restart, do the restart
            socket.close(4205, 'Client Restart');
          } else {
            // otherwise the socket might've closed, indicate that you want
            // a restart on the next opened event
            restartRequested = true;
          }
        };

        // just in case you were eager to restart
        if (restartRequested) {
          restartRequested = false;
          restart();
        }
      },
    },
  });

  return {
    ...client,
    restart: () => restart(),
  };
}

export default class WebSocketLink extends ApolloLink {
  private client: RestartableClient;

  constructor(options: ClientOptions) {
    super();
    this.client = createRestartableClient(options);
  }

  public restart() {
    this.client.restart();
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
