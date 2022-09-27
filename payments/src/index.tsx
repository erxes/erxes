import './index.css';

import { ApolloProvider } from '@apollo/client';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import apolloClient from './apolloClient';
import PaymentsContainer from './containers/Payments';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ApolloProvider client={apolloClient}>
    <Router>
      <PaymentsContainer />
    </Router>
  </ApolloProvider>
);

reportWebVitals();
