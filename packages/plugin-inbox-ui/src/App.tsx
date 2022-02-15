import { PluginLayout } from '@erxes/ui/src/styles/main';
import React from 'react';
import GeneralRoutes from './generalRoutes';
import { AppProvider } from 'coreui/appContext';

const App = () => {
  const currentUser = {
    _id: "1",
    username: "anu",
    isOwner: true,
    email: "anu.b@nmma.co"
  };

  return (
    <PluginLayout>
      <AppProvider currentUser={currentUser}>
        <GeneralRoutes />
      </AppProvider>
    </PluginLayout>
  );
};

export default App;