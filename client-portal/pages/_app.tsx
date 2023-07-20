import "react-select-plus/dist/react-select-plus.css";
import "@nateradebaugh/react-datetime/dist/css/styles.css";

import "../styles/globals.css";

import AppProvider, { AppConsumer } from "../modules/appContext";

import { ApolloProvider } from "@apollo/client";
import React from "react";
import Script from "../modules/common/Script";
import { Store } from "../modules/types";
import withApolloClient from "./api/lib/withApolloClient";

type Props = {
  pageProps: any;
  Component: any;
  apolloClient: any;
  router: any;
};

function MyApp({ Component, pageProps, apolloClient, router }: Props) {
  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} router={router} />
      <AppProvider>
        <AppConsumer>
          {({ config }: Store) => {
            return (
              <>
                {config.messengerBrandCode ? (
                  <Script messengerBrandCode={config.messengerBrandCode} />
                ) : null}
              </>
            );
          }}
        </AppConsumer>
      </AppProvider>
    </ApolloProvider>
  );
}

export default withApolloClient(MyApp);
