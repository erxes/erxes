import React from "react";
import "react-select-plus/dist/react-select-plus.css";
import "../styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import withApolloClient from "./api/lib/withApolloClient";
import { Store } from "../modules/types";
import { getEnv } from "../utils/configs";
import AppProvider, { AppConsumer } from "../modules/appContext";

type Props = {
  pageProps: any;
  Component: any;
  apolloClient: any;
  router: any;
};

const { REACT_APP_DOMAIN } = getEnv();

class Script extends React.Component<{ brandCode: string }> {
  componentDidMount() {
    (window as any).erxesSettings = {
      messenger: {
        brand_id: this.props.brandCode,
      },
    };

    (() => {
      const script = document.createElement("script");
      script.src = `${
        REACT_APP_DOMAIN.includes("https")
          ? `${REACT_APP_DOMAIN}/widgets`
          : "http://localhost:3200"
      }/build/messengerWidget.bundle.js`;
      script.async = true;

      const entry = document.getElementsByTagName("script")[0];
      entry.parentNode.insertBefore(script, entry);
    })();
  }

  render() {
    return null;
  }
}

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
                  <Script brandCode={config.messengerBrandCode} />
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
