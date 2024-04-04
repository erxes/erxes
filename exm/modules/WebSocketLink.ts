import { ApolloLink, FetchResult, Observable, Operation } from '@apollo/client';
import { Client, ClientOptions, createClient } from 'graphql-ws';

import { print } from 'graphql';

export default class WebSocketLink extends ApolloLink {
    private client: Client;
  
    constructor(options: ClientOptions) {
      super();
      this.client = createClient(options);
    }
  
    public request(operation: Operation): Observable<FetchResult> {
      return new Observable((sink) => {
        return this.client.subscribe<FetchResult>(
          { ...operation, query: print(operation.query) },
          {
            next: sink.next.bind(sink),
            complete: sink.complete.bind(sink),
            error: sink.error.bind(sink),
          },
        );
      });
    }
  }