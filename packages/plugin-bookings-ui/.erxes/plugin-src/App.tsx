import React from "react";
import { ApolloProvider } from "react-apollo";
import apolloClient from "@erxes/ui/src/apolloClient";
import GeneralRoutes from "./generalRoutes";
import '@erxes/ui/src/styles/global-styles.ts';
import { PluginLayout } from "@erxes/ui/src/styles/main";

const App = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <PluginLayout>
        <GeneralRoutes />
      </PluginLayout>
    </ApolloProvider>
  );
};

export default App;
