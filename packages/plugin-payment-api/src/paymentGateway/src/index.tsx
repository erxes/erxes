import { ApolloProvider } from '@apollo/client';
import { AppProvider } from './appContext';

import React from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'query-string';
import { client } from './apolloClient';
import Payments from './containers/Payments';
import Modal from 'react-modal';
// import './common/styles.css';

const appToken =
  (window as any).appToken ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOnsiY3JlYXRlZEF0IjoiMjAyNC0wMy0xM1QwMDoyNTozNy45MzBaIiwibmFtZSI6InBheW1lbnQiLCJ1c2VyR3JvdXBJZCI6ImNNbDBhUGNRNUFQTkQ5UTdjdkVpNiIsImV4cGlyZURhdGUiOiIyMDI0LTA0LTEyVDA1OjUzOjMyLjQxN1oiLCJhbGxvd0FsbFBlcm1pc3Npb24iOmZhbHNlLCJub0V4cGlyZSI6dHJ1ZSwiX2lkIjoiUkpVNGtJc3FoOFNnVWw0SjN4TTZhIiwiX192IjowfSwiaWF0IjoxNzEwMzA5MjIzfQ.cq8PXxhVZL3H0eHcL5H1hqbrcr1oSvN9t7RmLcS_aSQ';

const App = () => {
  const pathname = window.location.pathname;
  const queryParams = parse(window.location.search);

  let children;

  console.log('pathname', pathname);
  console.log('queryParams', queryParams);

  if (!appToken) {
    return <div>Unauthorized</div>;
  }

  const invoiceId = pathname.split('/').pop()
  if (!invoiceId) {
    return <div>Bad request</div>;
  }
  

  // children = <div>Hello world</div>;

  children = <Payments invoiceId={invoiceId} appToken={appToken} />;

  return (
    <AppProvider value={{ pathname, queryParams }}>{children}</AppProvider>
  );
};

Modal.setAppElement('#payment-gateway');

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.querySelector('#payment-gateway')
);
