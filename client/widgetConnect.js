/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import client, { createStore } from './apollo-client';

// base connect function for all widgets
const widgetConnect = (params) => {
  const {
    postParams,
    connectMutation,
    connectCallback,
    AppContainer,
    reducers,
  } = params;

  window.addEventListener('message', (event) => {
    // connect to api using passed setting
    if (!(event.data.fromPublisher && event.data.setting)) {
      return;
    }

    // call connect mutation
    connectMutation(event)

    .then(({ data }) => {
      // check connection and save connection info
      connectCallback(data);

      console.log('connected ...'); // eslint-disable-line

      // notify parent window that connected
      window.parent.postMessage({
        fromErxes: true,
        ...postParams,
        action: 'connected',
        connectionInfo: data,
        setting: event.data.setting,
      }, '*');

      // render root react component
      ReactDOM.render(
        <ApolloProvider store={createStore(reducers)} client={client}>
          <AppContainer />
        </ApolloProvider>,
        document.getElementById('root'),
      );
    })

    .catch((error) => {
      console.log(error); // eslint-disable-line
      console.log('Integration not found'); // eslint-disable-line
    });
  });
};

export default widgetConnect;
