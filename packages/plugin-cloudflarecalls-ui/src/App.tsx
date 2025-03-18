import React from 'react';
import GeneralRoutes from './generalRoutes';
import { PluginLayout } from '@erxes/ui/src/styles/main';
import '@erxes/ui/src/styles/global-styles';
import 'erxes-icon/css/erxes.min.css';
import '@erxes/ui/src/styles/style.min.css';
import { RoomProvider } from './RoomProvider';

export * from './lib/types';

const App = () => {
  return (
    <PluginLayout>
      <RoomProvider>
        <GeneralRoutes />
      </RoomProvider>
    </PluginLayout>
  );
};

export default App;
