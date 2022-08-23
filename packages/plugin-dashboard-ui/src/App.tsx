import React from 'react';
import GeneralRoutes from './generalRoutes';
import { PluginLayout } from '@erxes/ui/src/styles/main';
import { AppProvider } from 'coreui/appContext';
import { CubeProvider } from '@cubejs-client/react';
import cubejs from '@cubejs-client/core';

const App = () => {
  fetch(`http://localhost:4300/get-token`)
    .then(response => {
      if (response.ok) {
        return response.json();
      }

      throw new Error(response.status.toString());
    })
    .then(response => {
      const dashboardToken = response.dashboardToken;

      localStorage.setItem('dashboardToken', dashboardToken);

      const cubejsApi = cubejs(dashboardToken, {
        apiUrl: `http://localhost:4300`
      });

      return (
        <CubeProvider cubejsApi={cubejsApi}>
          <AppProvider>
            <PluginLayout>
              <GeneralRoutes />
            </PluginLayout>
          </AppProvider>
        </CubeProvider>
      );
    });
};

export default App;
