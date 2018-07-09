/* global FileReader */

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import client from '../apollo-client';
import { KnowledgeBase } from './containers';
import { connection } from './connection';
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
    <ApolloProvider client={client}>
      <KnowledgeBase />
    </ApolloProvider>,
    document.getElementById('root'),
  );
});
