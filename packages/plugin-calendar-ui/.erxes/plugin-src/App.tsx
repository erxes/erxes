import React from 'react';
import { PluginLayout } from '@erxes/ui/src/styles/main';
import { ApolloProvider } from 'react-apollo';
import apolloClient from '@erxes/ui/src/apolloClient';
import GeneralRoutes from './generalRoutes';

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
