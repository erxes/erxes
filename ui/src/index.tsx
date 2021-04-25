import '@nateradebaugh/react-datetime/css/react-datetime.css';
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

import { datadogRum } from '@datadog/browser-rum';

const envs = getEnv();

datadogRum.init({
  applicationId: envs.REACT_APP_DD_APPLICATION_ID || '',
  clientToken: envs.REACT_APP_DD_CLIENT_TOKEN || '',
  service: envs.REACT_APP_DD_SERVICE || '',
  // applicationId: 'a38ad11b-3427-47c6-a317-32c8bb25a248',
  // clientToken: 'pub487ab821e2db8e946d52bda8c03d6ee',
  site: 'datadoghq.com',
  sampleRate: 100,
  trackInteractions: true,
  allowedTracingOrigins: [envs.REACT_APP_API_URL || '']
});

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc, { parseLocal: true });

const target = document.querySelector('#root');

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
