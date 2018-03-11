/* global FileReader LANGUAGE_CODE */

/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import client, { createStore } from './apollo-client';
import TranslationWrapper from './TranslationWrapper';
import T from 'i18n-react';
import translation from '../locales';
import moment from 'moment';


// base connect function for all widgets
const widgetConnect = (params) => {
  const {
    postParams,
    connectMutation,
    connectCallback,
    AppContainer,
    reducers,
  } = params;

  // set locale moment
  moment.locale('mn', {
    relativeTime: {
      future: '%s дараа',
      past: '%s өмнө',
      s: 'саяхан',
      m: 'минутын',
      mm: '%d минутын',
      h: '1 цагийн',
      hh: '%d цагийн',
      d: '1 өдрийн',
      dd: '%d өдрийн',
      M: '1 сарын',
      MM: '%d сарын',
      y: '1 жилийн',
      yy: '%d жилийн',
    },
  });

  // load translation resources
  T.setTexts(translation[LANGUAGE_CODE]);
  moment.locale(LANGUAGE_CODE || 'en');

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
