import './index.css';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import ReactDOM from 'react-dom/client';

import PaymentsContainer from './containers/Payments';
import reportWebVitals from './reportWebVitals';

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/graphql` : 'http://localhost:3305/graphql',
  cache: new InMemoryCache(),
});

console.log("process.env.REACT_APP_API_URL: ", process.env.PORT);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <ApolloProvider client={client}>
    <PaymentsContainer />
  </ApolloProvider>
);


reportWebVitals();
