import React from "react";
import "react-select-plus/dist/react-select-plus.css";
import "../styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import withApolloClient from './lib/withApolloClient';

type Props = {
  pageProps: any;
  Component: any;
  apolloClient: any
  router: any;
};

function MyApp({
  Component,
  pageProps,
  apolloClient,
  router,
}: Props) {
  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} router={router} />
    </ApolloProvider>
  );
}

export default withApolloClient(MyApp);