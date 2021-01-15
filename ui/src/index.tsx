import '@nateradebaugh/react-datetime/css/react-datetime.css';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import 'erxes-icon/css/erxes.min.css';
// global style
import 'modules/common/styles/global-styles.ts';
import { getEnv } from 'modules/common/utils';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { render } from 'react-dom';

Sentry.init({
  dsn:
    process.env.NODE_ENV === 'development'
      ? 'https://125ed83537ee441d9b16b20d631e6130@sentry.erxes.io/6'
      : 'https://42a5f5d167524ab4b15a66e78a78fb49@sentry.erxes.io/17',

  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: [process.env.REACT_APP_API_URL || '']
    })
  ],

  tracesSampleRate: 1.0
});

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc, { parseLocal: true });

const target = document.querySelector('#root');

const envs = getEnv();

fetch(`${envs.REACT_APP_API_URL}/initial-setup?envs=${JSON.stringify(envs)}`, {
  credentials: 'include'
})
  .then(response => response.text())
  .then(res => {
    const apolloClient = require('./apolloClient').default;
    const { OwnerDescription } = require('modules/auth/components/OwnerSetup');
    const OwnerSetup = require('modules/auth/containers/OwnerSetup').default;
    const Routes = require('./routes').default;
    const AuthLayout = require('modules/layout/components/AuthLayout').default;

    let body = <Routes />;

    if (res === 'no owner') {
      body = (
        <AuthLayout
          col={{ first: 5, second: 6 }}
          content={<OwnerSetup />}
          description={<OwnerDescription />}
        />
      );
    }

    return render(
      <ApolloProvider client={apolloClient}>{body}</ApolloProvider>,
      target
    );
  });
