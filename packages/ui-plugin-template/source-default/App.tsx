import React from 'react';
import GeneralRoutes from './generalRoutes';
import { PluginLayout } from '@erxes/ui/src/styles/main';

const App = () => {
  return (
    <PluginLayout>
      <GeneralRoutes />
    </PluginLayout>
  );
};

export default App;
