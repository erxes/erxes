import { PluginLayout } from '@erxes/ui/src/styles/main';
import React from 'react';
import GeneralRoutes from './generalRoutes';
import { AppProvider } from 'coreui/appContext';
import { dummyUser } from '@erxes/ui/src/constants/dummy-data'

const App = () => {
  return (
    <PluginLayout>
      <AppProvider currentUser={dummyUser}>
        <GeneralRoutes />
      </AppProvider>
    </PluginLayout>
  );
};

export default App;