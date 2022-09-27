import './index.css';

import { ApolloProvider } from '@apollo/client';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import PaymentsContainer from './containers/Payments';
import reportWebVitals from './reportWebVitals';

const apolloClient = require('./apolloClient').default;

render(
  <ApolloProvider client={apolloClient}>
    <Router>
      <PaymentsContainer />
    </Router>
  </ApolloProvider>,
  document.querySelector('#root')
);

reportWebVitals();
