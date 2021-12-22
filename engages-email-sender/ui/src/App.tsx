import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "react-apollo";
import apolloClient from "erxes-ui/lib/apolloClient";

import MessageList from "modules/engages/containers/MessageList";

const App = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <MessageList queryParams={{}} loading={false} type="test" />
    </ApolloProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
