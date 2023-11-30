import React from 'react';
import GeneralRoutes from './generalRoutes';
import { PluginLayout } from '@erxes/ui/src/styles/main';
import '@erxes/ui/src/styles/global-styles';
import 'erxes-icon/css/erxes.min.css';
import '@erxes/ui/src/styles/style.min.css';
import SipProvider from './components/SipProvider';

export * from './lib/enums';
export * from './lib/types';

export { SipProvider };

const App = () => {
  return (
    <PluginLayout>
      <GeneralRoutes />
    </PluginLayout>
  );
};

export default App;
