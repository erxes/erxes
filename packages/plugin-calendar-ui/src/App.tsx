import React from 'react';
import { PluginLayout } from '@erxes/ui/src/styles/main';
import GeneralRoutes from './generalRoutes';
import { AppProvider } from 'coreui/appContext';
import { dummyUser } from '@erxes/ui/src/constants/dummy-data';

const App = () => {
  return (
    <AppProvider currentUser={dummyUser}>
      <PluginLayout>
        <GeneralRoutes />
      </PluginLayout>
    </AppProvider>
  );
};

export default App;
