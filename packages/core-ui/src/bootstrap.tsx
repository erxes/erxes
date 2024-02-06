import '@nateradebaugh/react-datetime/css/react-datetime.css';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import 'erxes-icon/css/erxes.min.css';
// global style
import '@erxes/ui/src/styles/global-styles.ts';
import React from 'react';
import { render } from 'react-dom';
import { getEnv, readFile } from 'modules/common/utils';
import { ApolloProvider } from '@apollo/client';
import { getThemeItem } from '@erxes/ui/src/utils/core';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc, { parseLocal: true });

const target = document.querySelector('#root');

const { VERSION } = getEnv();

console.log(VERSION);

if (VERSION && VERSION === 'saas') {
  const wenv = (window as any).env || {};
  const getItem = (name) =>
    wenv[name] || process.env[name] || 'https://erxes.io';
  const REACT_APP_CORE_URL = getItem('REACT_APP_CORE_URL');

  const normalize = (domain) =>
    domain
      .replace('https://', '')
      .replace('http://', '')
      .replace('www.', '')
      .replace('/', '');

  const onResponse = (response) => {
    const { hostname, pathname, search, port, hash } = window.location;
    const currentHostname = `${hostname}${port ? `:${port}` : ''}`;

    if (response.domain && response.dnsStatus === 'active') {
      // from subdomain to domain if whiteLabel is valid
      if (
        response.isWhiteLabel &&
        normalize(currentHostname) !== normalize(response.domain)
      ) {
        return window.location.replace(
          `${response.domain}${pathname}${search}${hash}`,
        );
      }

      // from domain to subdomain if whiteLabel is expired.
      if (
        normalize(currentHostname) === normalize(response.domain) &&
        !response.isWhiteLabel
      ) {
        return window.location.replace(
          `https://${response.subdomain}.app.erxes.io${pathname}${search}${hash}`,
        );
      }
    }

    const subdomain = response.subdomain;
    const dashboardToken = response.dashboardToken;

    (window as any).erxesEnv = { subdomain, dashboardToken };

    const Routes = require('./routes').default;
    const apolloClient = require('./apolloClient').default;

    if (response.isWhiteLabel) {
      // Save organization info for white label customers
      localStorage.setItem(
        'organizationInfo',
        JSON.stringify({
          icon: response.icon,
          name: response.name,
          logo: response.logo,
          domain: response.domain,
          favicon: response.favicon,
          iconColor: response.iconColor,
          textColor: response.textColor,
          dnsStatus: response.dnsStatus,
          backgroundColor: response.backgroundColor,
          description: response.description,
        }),
      );
    } else {
      localStorage.removeItem('organizationInfo');
    }

    const notShowPlugins: any[] = response.notShowPlugins || [];

    (window as any).plugins = ((window as any).plugins || []).filter(
      (p) => !notShowPlugins.includes(p.name),
    );

    render(
      <ApolloProvider client={apolloClient}>
        <Routes />
      </ApolloProvider>,
      target,
    );
  };

  if (process.env.NODE_ENV === 'production') {
    fetch(`${REACT_APP_CORE_URL}/check-subdomain`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        throw new Error(response.status.toString());
      })
      .then((response) => {
        onResponse(response);
      })
      .catch((e) => {
        // tslint:disable-next-line
        console.log(`Error during check domain ${e.message}`);

        (window as any).erxesEnv = {};

        const NotFound = require('modules/layout/components/NotFound');

        render(<NotFound />, target);
      });
  } else {
    onResponse({ subdomain: location.hostname.split('.')[0] });
  }
} else {
  const envs = getEnv();

  fetch(
    `${envs.REACT_APP_API_URL}/initial-setup?envs=${JSON.stringify(envs)}`,
    {
      credentials: 'include',
    },
  )
    .then((response) => response.text())
    .then((res) => {
      if (res !== 'no owner') {
        localStorage.setItem('erxes_theme_configs', res);

        const link = document.createElement('link');
        link.id = 'favicon';
        link.rel = 'shortcut icon';

        const favicon = getThemeItem('favicon');
        link.href =
          favicon && typeof favicon === 'string'
            ? readFile(favicon)
            : '/favicon.png';

        document.head.appendChild(link);
      }

      const apolloClient = require('./apolloClient').default;
      const {
        OwnerDescription,
      } = require('modules/auth/components/OwnerSetup');
      const OwnerSetup = require('modules/auth/containers/OwnerSetup').default;
      const Routes = require('./routes').default;
      const AuthLayout =
        require('@erxes/ui/src/layout/components/AuthLayout').default;

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
        target,
      );
    });
}
