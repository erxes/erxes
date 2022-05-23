import React from 'react';
import { PluginLayout } from '@erxes/ui/src/styles/main';
import GeneralRoutes from './generalRoutes';
import { AppProvider } from '@erxes/ui/src/appContext';
import { dummyUser } from '@erxes/ui/src/constants/dummy-data';

const App = () => {
  console.log('sfsfsgdfghsdghfdgh');
  return (
    <AppProvider currentUser={dummyUser}>
      <PluginLayout>
        <GeneralRoutes />
      </PluginLayout>
    </AppProvider>
  );
};

export default App;
