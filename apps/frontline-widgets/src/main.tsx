import * as ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';

import { Toaster, Tooltip } from 'erxes-ui';

import App from './app/app';
import { apolloClient } from './lib/apollo-client';
import './styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <ApolloProvider client={apolloClient}>
    <BrowserRouter>
      <Tooltip.Provider>
        <App />
        <Toaster />
      </Tooltip.Provider>
    </BrowserRouter>
  </ApolloProvider>,
);
