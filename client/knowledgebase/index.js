import { ApolloProvider } from 'react-apollo';
import React from 'react';
import ReactDOM from 'react-dom';
import client, { createStore } from '../apollo-client';
import { App } from './containers';
import { connection } from './connection';
import reducers from './reducers';

window.addEventListener('message', (event) => {
  if (!(event.data.fromPublisher && event.data.setting)) {
    return;
  }

  console.log('setting: ', event.data.setting);

  connection.data.topicId = event.data.setting.topic_id;
  // notify parent window that connected
  // window.parent.postMessage({
  //   fromErxes: true,
  //   fromKnowledgeBase: true,
  //   action: 'connected',
  //   connectionInfo: data,
  //   setting: event.data.setting,
  // }, '*');

  ReactDOM.render(
    <ApolloProvider store={createStore(reducers)} client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById('root'),
  );
});
