import { ApolloProvider } from '@apollo/client';
import { AppProvider } from './appContext';

import React from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'query-string';
import { client } from './apolloClient';
import Payments from './containers/Payments';
import Modal from 'react-modal';
import './common/newstyles.css';

const App = () => {
  const pathname = window.location.pathname;
  const queryParams = parse(window.location.search);
  const apiDomain = (window as any).apiDomain;

  let children;

  const invoiceId = (window as any).invoiceId;
  if (!invoiceId) {
    return <div className="py-12 text-center">Bad request</div>;
  }

  children = <Payments invoiceId={invoiceId} apiDomain={apiDomain} />;

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
