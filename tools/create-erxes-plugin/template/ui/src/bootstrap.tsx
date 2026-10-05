import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Main } from './modules/changemodule/Main';
import './styles.css';

/**
 * Standalone dev entry — when erxes loads this remote it mounts the exposed
 * modules inside core-ui's own providers, so this file is only used by
 * `rspack serve`. Point REACT_APP_API_URL at a running gateway (default
 * http://localhost:4000) to query through the federation.
 */
const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/graphql`,
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/changeme/changemodule" element={<Main />} />
          <Route path="*" element={<Main />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
);
