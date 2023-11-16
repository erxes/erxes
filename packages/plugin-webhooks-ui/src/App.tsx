import React from 'react';
import GeneralRoutes from './generalRoutes';
import { AppProvider } from 'coreui/appContext';
import '@erxes/ui/src/styles/global-styles';
import 'erxes-icon/css/erxes.min.css';
import '@erxes/ui/src/styles/style.min.css';

const App = () => {
  return (
    <AppProvider>
      <GeneralRoutes />
    </AppProvider>
  );
};

export default App;
