import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import Routes from './routes';
import store from './store';
import apolloClient from './apolloClient';

// TODO: remove
import 'css/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// override old style
import './modules/common/styles/global-styles.js';

const target = document.querySelector('#root');

render(
  <ApolloProvider store={store} client={apolloClient}>
    <Routes />
  </ApolloProvider>,
  target
);
