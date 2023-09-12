import "react-select-plus/dist/react-select-plus.css";
import "erxes-icon/css/erxes.min.css";
import "@nateradebaugh/react-datetime/css/react-datetime.css";
import "../styles/globals.css";

import AppProvider, { AppConsumer } from "../modules/appContext";

import { ApolloProvider } from "@apollo/client";
import MainLayout from "../modules/layout/components/MainLayout";
import React from "react";
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
      <AppProvider>
        <AppConsumer>
          {({ currentUser }: any) => {
            if (currentUser) {
              return (
                <MainLayout currentUser={currentUser}>
                  <Component
                    {...pageProps}
                    router={router}
                    currentUser={currentUser}
                  />
                </MainLayout>
              );
            }

            return (
              <Component
                {...pageProps}
                router={router}
                currentUser={currentUser}
              />
            );
          }}
        </AppConsumer>
      </AppProvider>
    </ApolloProvider>
  );
}

export default withApolloClient(MyApp);
