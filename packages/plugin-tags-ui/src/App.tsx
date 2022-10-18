import React from 'react';
import GeneralRoutes from './generalRoutes';
import { PluginLayout } from '@erxes/ui/src/styles/main';
import { AppProvider } from 'coreui/appContext';

const App = () => {
  return (
    <AppProvider>
      <PluginLayout>
        <GeneralRoutes />
      </PluginLayout>
    </AppProvider>
  );
};

export default App;
