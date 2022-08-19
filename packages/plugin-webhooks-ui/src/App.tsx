
import React from 'react';
import GeneralRoutes from './generalRoutes';
import { AppProvider } from 'coreui/appContext'

const App = () => {
  return (
    <AppProvider>
      <GeneralRoutes />
    </AppProvider>
  );
};

export default App;