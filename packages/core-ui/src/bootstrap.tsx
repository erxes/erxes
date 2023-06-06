import '@nateradebaugh/react-datetime/css/react-datetime.css';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import dayjs from 'dayjs';
import * as Sentry from '@sentry/react';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import 'erxes-icon/css/erxes.min.css';
// global style
import '@erxes/ui/src/styles/global-styles.ts';
import { getEnv, readFile } from 'modules/common/utils';
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { render } from 'react-dom';
import { getThemeItem } from '@erxes/ui/src/utils/core';

import { setVerbosity } from 'ts-invariant';
setVerbosity('warn');

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
    if (res !== 'no owner') {
      localStorage.setItem('erxes_theme_configs', res);

      const link = document.createElement('link');
      link.id = 'favicon';
      link.rel = 'shortcut icon';
      link.href = getThemeItem('favicon')
        ? readFile(getThemeItem('favicon'))
        : '/favicon.png';

      document.head.appendChild(link);
    }

    const apolloClient = require('./apolloClient').default;
    const { OwnerDescription } = require('modules/auth/components/OwnerSetup');
    const OwnerSetup = require('modules/auth/containers/OwnerSetup').default;
    const Routes = require('./routes').default;
    const AuthLayout = require('@erxes/ui/src/layout/components/AuthLayout')
      .default;

    if (envs.REACT_APP_APM_SERVER_URL) {
      Sentry.init({
        dsn: envs.REACT_APP_APM_SERVER_URL,
        integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
        // Session Replay
        replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
      });
    }

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
