import { ApolloLink, Operation, FetchResult, Observable } from 'apollo-link';
import { print } from 'graphql';
import { createClient, ClientOptions, Client } from 'graphql-ws';

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