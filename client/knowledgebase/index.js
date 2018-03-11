/* global FileReader LANGUAGE_CODE */

import React from 'react';
import ReactDOM from 'react-dom';
import client, { createStore } from '../apollo-client';
import { ApolloProvider } from 'react-apollo';
import { KnowledgeBase } from './containers';
import { connection } from './connection';
import reducers from './reducers';
import './sass/style.scss';
import TranslationWrapper from '../TranslationWrapper';
import T from 'i18n-react';
import translation from '../../locales';
import moment from 'moment';

window.addEventListener('message', (event) => {
  if (!(event.data.fromPublisher && event.data.setting)) {
    return;
  }

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

  // load translations
  T.setTexts(translation[LANGUAGE_CODE]);
  moment.locale(LANGUAGE_CODE || 'en');

  connection.setting = event.data.setting;
  // render root react component
  ReactDOM.render(
    <ApolloProvider store={createStore(reducers)} client={client}>
      <TranslationWrapper>
        <KnowledgeBase />
      </TranslationWrapper>
    </ApolloProvider>,
    document.getElementById('root'),
  );
});
