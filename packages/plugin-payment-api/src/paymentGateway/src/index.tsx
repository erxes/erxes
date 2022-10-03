import './index.css';

import { ApolloProvider } from '@apollo/client';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import apolloClient from './apolloClient';
import PaymentsContainer from './containers/Payments';

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <Router>
      <PaymentsContainer />
    </Router>
  </ApolloProvider>,
  document.querySelector('#app')
);
