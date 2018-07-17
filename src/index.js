import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import Routes from './routes';
import apolloClient from './apolloClient';

import 'erxes-icon/css/erxes.min.css';
import 'react-datetime/css/react-datetime.css';
import 'react-toggle/style.css';
// global style
import 'modules/common/styles/global-styles.js';

const target = document.querySelector('#root');

render(
  <ApolloProvider client={apolloClient}>
    <Routes />
  </ApolloProvider>,
  target
);
