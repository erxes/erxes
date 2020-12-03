import cubejs from '@cubejs-client/core';
import { CubeProvider } from '@cubejs-client/react';
import 'antd/dist/antd.min.css';
import 'erxes-icon/css/erxes.min.css';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { render } from 'react-dom';
import apolloClient, { getEnv } from './apolloClient';
import './index.css';

import Routes from './routes';

const target = document.getElementById('root');

const { REACT_APP_DASHBOARD_API_URL } = getEnv();

fetch(`${REACT_APP_DASHBOARD_API_URL}/get-token`)
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
      apiUrl: `${REACT_APP_DASHBOARD_API_URL}/cubejs-api/v1`
    });

    render(
      <CubeProvider cubejsApi={cubejsApi}>
        <ApolloProvider client={apolloClient}>
          <Routes />
        </ApolloProvider>
      </CubeProvider>,
      target
    );
  });
