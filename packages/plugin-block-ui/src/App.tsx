import React from 'react';
import { PluginLayout } from '@erxes/ui/src/styles/main';
import { AppProvider } from 'coreui/appContext';
import GeneralRoutes from './generalRoutes';
import '@erxes/ui/src/styles/global-styles';
import 'erxes-icon/css/erxes.min.css';
import '@erxes/ui/src/styles/style.min.css';

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
