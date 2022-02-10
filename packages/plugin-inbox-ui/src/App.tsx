import { PluginLayout } from '@erxes/ui/src/styles/main';
import React from 'react';
import GeneralRoutes from './generalRoutes';
import { AppProvider } from '@erxes/ui/src/appContext';
import { IUser } from '@erxes/ui/src/auth/types';

const App = () => {
  console.log('in Appppppp')
  return (
    <PluginLayout>
      <AppProvider currentUser={{username: "anu"} as IUser}>
        <GeneralRoutes />
      </AppProvider>
    </PluginLayout>
  );
};

export default App;