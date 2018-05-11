/* global FileReader */

/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import client, { createStore } from './apollo-client';
import TranslationWrapper from './TranslationWrapper';

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

        // notify parent window that connected
        window.parent.postMessage(
          {
            fromErxes: true,
            ...postParams,
            message: 'connected',
            connectionInfo: data,
            setting: event.data.setting,
          },
          '*',
        );

        // render root react component
        ReactDOM.render(
          <ApolloProvider store={createStore(reducers)} client={client}>
            <TranslationWrapper>
              <AppContainer />
            </TranslationWrapper>
          </ApolloProvider>,
          document.getElementById('root'),
        );
      })

      .catch((error) => {
        console.log(error); // eslint-disable-line
      });
  });
};

export default widgetConnect;
