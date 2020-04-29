import React from 'react';
import { render } from 'react-dom';
import './index.css';

import { CubeProvider } from '@cubejs-client/react';
import { ApolloProvider } from 'react-apollo';

import cubejs from '@cubejs-client/core';
import apolloClient, { getEnv } from './apolloClient';
import Routes from './routes';

const target = document.querySelector('#root');

const { REACT_APP_CUBEJS_TOKEN, REACT_APP_CUBEJS_API_URL } = getEnv();

const cubejsApi = cubejs(REACT_APP_CUBEJS_TOKEN, {
  apiUrl: `${REACT_APP_CUBEJS_API_URL}/cubejs-api/v1`
});

render(
  <CubeProvider cubejsApi={cubejsApi}>
    <ApolloProvider client={apolloClient}>
      <Routes />
    </ApolloProvider>
  </CubeProvider>,
  target
);
