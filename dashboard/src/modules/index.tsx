import React from 'react';
import { render } from 'react-dom';
import './index.css';

import { ApolloProvider } from 'react-apollo';
import { CubeProvider } from '@cubejs-client/react';

import apolloClient, { getEnv } from './apolloClient';
import cubejs from '@cubejs-client/core';
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
