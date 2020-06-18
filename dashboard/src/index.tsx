import cubejs from '@cubejs-client/core';
import { CubeProvider } from '@cubejs-client/react';
import 'antd/dist/antd.min.css';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { render } from 'react-dom';
import apolloClient, { getEnv } from './apolloClient';
import './index.css';

import Routes from './routes';

const target = document.getElementById('root');

const { REACT_APP_DASHBOARD_API_TOKEN, REACT_APP_DASHBOARD_API_URL } = getEnv();

const cubejsApi = cubejs(REACT_APP_DASHBOARD_API_TOKEN, {
  apiUrl: `${REACT_APP_DASHBOARD_API_URL}/cubejs-api/v1`,
});

render(
  <CubeProvider cubejsApi={cubejsApi}>
    <ApolloProvider client={apolloClient}>
      <Routes />
    </ApolloProvider>
  </CubeProvider>,
  target
);
