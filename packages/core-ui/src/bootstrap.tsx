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
import { ApolloProvider } from '@apollo/client';

const wenv = (window as any).env || {};
const getItem = (name) => wenv[name] || process.env[name] || 'https://erxes.io';

const REACT_APP_CORE_URL = getItem('REACT_APP_CORE_URL');

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc, { parseLocal: true });

const target = document.querySelector('#root');

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
