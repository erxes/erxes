import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

import { ApolloProvider } from '@apollo/client';
import { client } from './lib/apollo-client';

interface ApolloProps {
  children: any;
}

export const Apollo = ({ children }: ApolloProps) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Apollo>
      <App />
    </Apollo>
  </StrictMode>,
);
