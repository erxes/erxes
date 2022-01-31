import '@nateradebaugh/react-datetime/css/react-datetime.css';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import 'erxes-icon/css/erxes.min.css';
// global style
import 'modules/common/styles/global-styles.ts';
import { getEnv, readFile } from 'modules/common/utils';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { render } from 'react-dom';
import { getThemeItem } from 'utils';

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
