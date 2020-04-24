import '@nateradebaugh/react-datetime/css/react-datetime.css';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'erxes-icon/css/erxes.min.css';
// global style
import 'modules/common/styles/global-styles.ts';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { render } from 'react-dom';
import apolloClient, { getEnv } from './apolloClient';
import Routes from './routes';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

const target = document.querySelector('#root');

const envs = getEnv();

fetch(
  `${envs.REACT_APP_API_URL}/set-frontend-cookies?envs=${JSON.stringify(envs)}`,
  { credentials: 'include' }
)
  .then(response => response.text())
  .then(() => {
    render(
      <ApolloProvider client={apolloClient}>
        <Routes />
      </ApolloProvider>,
      target
    );
  });
