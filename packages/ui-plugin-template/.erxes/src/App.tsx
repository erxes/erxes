import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "@erxes/ui/src/apolloClient";
import Main from '../plugin-src';

const App = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <Main />
    </ApolloProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));