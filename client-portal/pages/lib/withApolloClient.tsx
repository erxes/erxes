import * as React from "react";
import { getDataFromTree } from "@apollo/client/react/ssr";
import initApollo from "./initApollo";
import Head from "next/head";
import { getEnv } from "../../utils/configs";

const { REACT_APP_API_DOMAIN } = getEnv();

const SERVER_LINK_OPTIONS = {
  uri: `${REACT_APP_API_DOMAIN}/graphql`,
  credentials: 'include'
};

export default (App) => {
  return class Apollo extends React.Component<any> {
    static displayName = "withApollo(App)";

    apolloClient: any;

    static async getInitialProps(ctx) {
      const {
        Component,
        router,
        ctx: { res },
      } = ctx;

      const apollo = initApollo(SERVER_LINK_OPTIONS, {});

      ctx.ctx.apolloClient = apollo;

      let appProps = {};

      if (App.getInitialProps) {
        appProps = await App.getInitialProps(ctx);
      }

      if (res && res.finished) {
        // When redirecting, the response is finished.
        // No point in continuing to render
        return {};
      }

      if (!process.browser) {
        // Run all graphql queries in the component tree
        // and extract the resulting data
        try {
          // Run all GraphQL queries
          await getDataFromTree(
            <App
              {...appProps}
              Component={Component}
              router={router}
              apolloClient={apollo}
            />
          );
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
          console.error("Error while running `getDataFromTree`", error.message);
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();
      }

      // Extract query data from the Apollo's store
      const apolloState = apollo.cache.extract();

      return {
        ...appProps,
        apolloState,
      };
    }

    constructor(props) {
      super(props);

      this.apolloClient = initApollo(SERVER_LINK_OPTIONS, props.apolloState);
    }

    render() {
      return (
        <App
          {...this.props}
          apolloClient={this.apolloClient}
        />
      );
    }
  };
};
