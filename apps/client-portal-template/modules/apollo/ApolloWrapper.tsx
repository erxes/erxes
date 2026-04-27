'use client';
// ^ this file needs the "use client" pragma

import { HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';

// have a function to create a client for you
function makeClient() {
  const authLink = new SetContextLink(({ headers }) => {
    // get the authentication token from local storage if it exists

    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        'x-app-token': process.env.NEXT_PUBLIC_ERXES_CP_TOKEN,
      },
    };
  });

  const httpLink = new HttpLink({
    // this needs to be an absolute url, as relative urls cannot be used in SSR
    uri: `${process.env.NEXT_PUBLIC_ERXES_API_URL}/graphql`,

    // you can disable result caching here if you want to
    // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
    fetchOptions: {
      // you can pass additional options that should be passed to `fetch` here,
      // e.g. Next.js-related `fetch` options regarding caching and revalidation
      // see https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options
    },
    // you can override the default `fetchOptions` on a per query basis
    // via the `context` property on the options passed as a second argument
    // to an Apollo Client data fetching hook, e.g.:
    // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { ... }}});
  });

  // use the `ApolloClient` from "@apollo/client-integration-nextjs"
  return new ApolloClient({
    // use the `InMemoryCache` from "@apollo/client-integration-nextjs"
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
