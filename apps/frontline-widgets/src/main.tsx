import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { Tooltip } from 'erxes-ui';

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
      </Tooltip.Provider>
    </BrowserRouter>
  </ApolloProvider>,
);
