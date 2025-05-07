import "@nateradebaugh/react-datetime/css/react-datetime.css";
import "abortcontroller-polyfill/dist/polyfill-patch-fetch";
import "erxes-icon/css/erxes.min.css";
// global style
import { GlobalStyle } from "@erxes/ui/src/styles/global-styles";

import { ApolloProvider } from "@apollo/client";
import React from "react";
import { createRoot } from "react-dom/client";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

const wenv = (window as any).env || {};
const getItem = name => wenv[name] || process.env[name] || "https://erxes.io";

const REACT_APP_CORE_URL = getItem("REACT_APP_CORE_URL");

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc, { parseLocal: true });

const target = document.getElementById("root") as any;

const normalize = domain =>
  domain
    .replace("https://", "")
    .replace("http://", "")
    .replace("www.", "")
    .replace("/", "");

const onResponse = response => {
  const { hostname, pathname, search, port, hash } = window.location;
  const currentHostname = `${hostname}${port ? `:${port}` : ""}`;

  if (response.domain && response.dnsStatus === "active") {
    // from subdomain to domain if whiteLabel is valid
    if (
      response.isWhiteLabel &&
      normalize(currentHostname) !== normalize(response.domain)
    ) {
      return window.location.replace(
        `${response.domain}${pathname}${search}${hash}`
      );
    }

    // from domain to subdomain if whiteLabel is expired.
    if (
      normalize(currentHostname) === normalize(response.domain) &&
      !response.isWhiteLabel
    ) {
      return window.location.replace(
        `https://${response.subdomain}.app.erxes.io${pathname}${search}${hash}`
      );
    }
  }

  const subdomain = response.subdomain;
  const dashboardToken = response.dashboardToken;

  (window as any).erxesEnv = { subdomain, dashboardToken };

  const Routes = require("./routes").default;
  const apolloClient = require("./apolloClient").default;

  if (response.isWhiteLabel) {
    // Save organization info for white label customers
    localStorage.setItem(
      "organizationInfo",
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
        description: response.description
      })
    );
  } else {
    localStorage.removeItem("organizationInfo");
  }

  const notShowPlugins: any[] = response.notShowPlugins || [];

  (window as any).plugins = ((window as any).plugins || []).filter(
    p => !notShowPlugins.includes(p.name)
  );

  // const REACT_APP_APM_SERVER_URL = getItem('REACT_APP_APM_SERVER_URL');

  // if (REACT_APP_APM_SERVER_URL) {
  //   Sentry.init({
  //     dsn: REACT_APP_APM_SERVER_URL,
  //     integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  //     // Performance Monitoring
  //     tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  //     // Session Replay
  //     replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  //     replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  //   });
  // }

  createRoot(target).render(
    <ApolloProvider client={apolloClient}>
      <Routes />
      <GlobalStyle />
    </ApolloProvider>
  );
};

if (process.env && process.env.NODE_ENV === "production") {
  fetch(`${REACT_APP_CORE_URL}/check-subdomain`)
    .then(response => {
      if (response.ok) {
        return response.json();
      }

      throw new Error(response.status.toString());
    })
    .then(response => {
      onResponse(response);
    })
    .catch(e => {
      // tslint:disable-next-line
      console.error(`Error during check domain ${e.message}`);

      (window as any).erxesEnv = {};

      const NotFound = require("modules/layout/components/NotFound");

      createRoot(target).render(<NotFound />);
    });
} else {
  onResponse({ subdomain: location.hostname.split(".")[0] });
}
