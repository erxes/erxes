import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import Routes from './routes';
import store from './store';
import apolloClient from './apolloClient';

import 'ionicons/css/ionicons.min.css';
import 'react-datetime/css/react-datetime.css';
import 'react-toggle/style.css';
// global style
import 'modules/common/styles/global-styles.js';

const target = document.querySelector('#root');

render(
  <ApolloProvider store={store} client={apolloClient}>
    <Routes />
  </ApolloProvider>,
  target
);
