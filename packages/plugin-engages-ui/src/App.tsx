import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "react-apollo";
import apolloClient from "erxes-ui/lib/apolloClient";
import GeneralRoutes from './generalRoutes';

const App = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <GeneralRoutes />
    </ApolloProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));