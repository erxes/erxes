/* global FileReader */

import React from 'react';
import ReactDOM from 'react-dom';
import client, { createStore } from '../apollo-client';
import { ApolloProvider } from 'react-apollo';
import { KnowledgeBase } from './containers';
import { connection } from './connection';
import reducers from './reducers';
import 'erxes-icon/css/erxes.min.css';
import './sass/style.scss';

window.addEventListener('message', (event) => {
  const data = event.data;

  if (!(data.fromPublisher && data.setting)) {
    return;
  }

  connection.setting = event.data.setting;

  // render root react component
  ReactDOM.render(
    <ApolloProvider store={createStore(reducers)} client={client}>
      <KnowledgeBase />
    </ApolloProvider>,
    document.getElementById('root'),
  );
});
