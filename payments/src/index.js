import './index.css';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import PaymentsContainer from './containers/Payments';
import reportWebVitals from './reportWebVitals';

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/graphql`
    : 'http://localhost:3304/graphql',
  cache: new InMemoryCache()
});

render(
  <ApolloProvider client={client}>
    <Router>
      <PaymentsContainer />
    </Router>
  </ApolloProvider>,
  document.querySelector('#root')
);

reportWebVitals();
