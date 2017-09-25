import React from 'react';
import ReactDOM from 'react-dom';
import client, { createStore } from '../apollo-client';
import { ApolloProvider } from 'react-apollo';
import { App } from './containers';
import { connection } from './connection';
import reducers from './reducers';
import './sass/style.scss';

window.addEventListener('message', (event) => {
  if (!(event.data.fromPublisher && event.data.setting)) {
    return;
  }

  connection.setting = event.data.setting;
  // render root react component
  ReactDOM.render(
    <ApolloProvider store={createStore(reducers)} client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById('root'),
  );
});
