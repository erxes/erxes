import React from 'react';
import GeneralRoutes from './generalRoutes';
import { PluginLayout } from '@erxes/ui/src/styles/main';
import { AppProvider } from '@erxes/ui/src/appContext';
import { IUser } from '@erxes/ui/src/auth/types';

const App = () => {
  return (
    <PluginLayout>
      <AppProvider currentUser={{} as IUser}>
        <GeneralRoutes />
      </AppProvider>
    </PluginLayout>
  );
};

export default App;

