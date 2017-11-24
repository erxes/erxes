import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import Routes from './routes';
import store from './store';
import apolloClient from './apolloClient';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-select-plus/dist/react-select-plus.css';
import 'react-toggle/style.css';
// global style
import './modules/common/styles/global-styles.js';

const target = document.querySelector('#root');

render(
  <ApolloProvider store={store} client={apolloClient}>
    <Routes />
  </ApolloProvider>,
  target
);
