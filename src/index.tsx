import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { render } from 'react-dom';
import apolloClient from './apolloClient';
import Routes from './routes';

import '@nateradebaugh/react-datetime/css/react-datetime.css';
import 'erxes-icon/css/erxes.min.css';
// global style
import 'modules/common/styles/global-styles.ts';
import 'react-toggle/style.css';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

const target = document.querySelector('#root');

render(
  <ApolloProvider client={apolloClient}>
    <Routes />
  </ApolloProvider>,
  target
);
