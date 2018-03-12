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
import { setMomentLocale } from '../utils';

window.addEventListener('message', (event) => {
  if (!(event.data.fromPublisher && event.data.setting)) {
    return;
  }

  // load translations
  T.setTexts(translation[LANGUAGE_CODE]);

  setMomentLocale();

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
