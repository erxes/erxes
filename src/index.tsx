import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { render } from 'react-dom';
import apolloClient from './apolloClient';
import Routes from './routes';

import 'draft-js-anchor-plugin/lib/plugin.css';
import 'draft-js-emoji-plugin/lib/plugin.css';
import 'draft-js-static-toolbar-plugin/lib/plugin.css';
import 'erxes-icon/css/erxes.min.css';
// global style
import 'modules/common/styles/global-styles.ts';
import 'react-datetime/css/react-datetime.css';
import 'react-toggle/style.css';

const target = document.querySelector('#root');

render(
  <ApolloProvider client={apolloClient}>
    <Routes />
  </ApolloProvider>,
  target
);
