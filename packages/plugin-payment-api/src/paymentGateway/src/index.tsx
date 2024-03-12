import { ApolloProvider } from '@apollo/client';
import { AppProvider } from './appContext';

import React from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'query-string';
import { client } from './apolloClient';
import Payments from './containers/Payments';
// import GlobalStyles from './common/global-styles';
import GlobalStyle = require('./common/global-styles');

const serverData = (window as any).serverData;

const App = () => {
  console.log('serverData', serverData);
  const pathname = window.location.pathname;
  const queryParams = parse(window.location.search);

  let children;

  // children = <div>Hello world</div>;

  children = <Payments />;

  return (
    <AppProvider value={{ pathname, queryParams }}>{children}</AppProvider>
  );
};

ReactDOM.render(
  <ApolloProvider client={client}>
    <GlobalStyle />
    <App />
  </ApolloProvider>,
  document.querySelector('#payment-gateway')
);
