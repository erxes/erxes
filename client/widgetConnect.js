/* global FileReader LANGUAGE_CODE */

/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import client, { createStore } from './apollo-client';
import TranslationWrapper from './TranslationWrapper';
import T from 'i18n-react';
import translation from '../locales';
import { setMomentLocale } from './utils';

// base connect function for all widgets
const widgetConnect = (params) => {
  const {
    postParams,
    connectMutation,
    connectCallback,
    AppContainer,
    reducers,
  } = params;

  // load translation resources
  T.setTexts(translation[LANGUAGE_CODE]);

  setMomentLocale();

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
            action: 'connected',
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
