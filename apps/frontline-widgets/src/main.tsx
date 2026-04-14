import * as ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';

import { Toaster } from 'erxes-ui';

import { AppRoutes } from './app/routes';
import { apolloClient } from './lib/apollo-client';
import './styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <ApolloProvider client={apolloClient}>
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  </ApolloProvider>,
);
