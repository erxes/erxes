import * as ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';

import { Toaster } from 'erxes-ui';

import { AppRoutes } from './app/routes';
import { apolloClient } from './lib/apollo-client';
import { holdEarlyPublisherMessages } from './lib/earlyPublisherMessages';
import './styles.css';

holdEarlyPublisherMessages();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <ApolloProvider client={apolloClient}>
    <BrowserRouter
      basename={
        window.env?.REACT_APP_WIDGETS_BASE_PATH?.replace(/\/+$/, '') || '/'
      }
    >
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  </ApolloProvider>,
);
