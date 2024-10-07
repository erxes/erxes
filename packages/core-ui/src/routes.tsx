import {
  Routes as BrowserRoutes,
  Route,
  BrowserRouter as Router,
  useLocation
} from "react-router-dom";
import { pluginLayouts, pluginRouters } from "./pluginUtils";
// import * as Sentry from "@sentry/react";

import AccountSuspended from "modules/saas/limit/AccountSuspend";
import { IUser } from "./modules/auth/types";
import OSAuthRoutes from "./modules/auth/routes";
import OnboardingRoutes from "./modules/saas/onBoarding/routes";
import React from "react";
import SAASAuthRoutes from "./modules/saas/auth/routes";
import SettingsRoutes from "./modules/settings/routes";
import TagRoutes from "./modules/tags/routes";
import ContactRoutes from "./modules/contacts/routes";
import SegmentRoutes from "./modules/segments/routes";
import ProductRoutes from "./modules/products/routes";
import FormRoutes from "./modules/forms/routes";
import WelcomeRoutes from "./modules/welcome/routes";
import InsightRoutes from "./modules/insights/routes";
import asyncComponent from "modules/common/components/AsyncComponent";
import { getVersion } from "@erxes/ui/src/utils/core";
import queryString from "query-string";
import withCurrentUser from "modules/auth/containers/withCurrentUser";
// import { getEnv } from "@erxes/ui/src/utils";
// import posthog from "posthog-js";
// import { initializeFaro } from "@grafana/faro-react";

const MainLayout = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "MainLayout" */ "modules/layout/containers/MainLayout"
    )
);

const OnboardingLayout = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "OnboardingLayout" */ "modules/saas/onBoarding/container/OnboardingLayout"
    )
);

const Unsubscribe = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Unsubscribe" */ "modules/auth/containers/Unsubscribe"
    )
);

const UserConfirmation = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - UserConfirmation" */ "@erxes/ui/src/team/containers/UserConfirmation"
    )
);

export const UnsubscribeComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Unsubscribe queryParams={queryParams} />;
};

const renderRoutes = currentUser => {
  const UserConfirmationComponent = () => {
    const location = useLocation();
    const queryParams = queryString.parse(location.search);

    return (
      <UserConfirmation queryParams={queryParams} currentUser={currentUser} />
    );
  };

  if (!sessionStorage.getItem("sessioncode")) {
    sessionStorage.setItem("sessioncode", Math.random().toString());
  }

  const { VERSION } = getVersion();
  // const {
  //   REACT_APP_SENTRY_URL,
  //   REACT_APP_PUBLIC_POSTHOG_KEY,
  //   REACT_APP_PUBLIC_POSTHOG_HOST,
  //   REACT_APP_FARO_COLLECTOR_URL,
  //   REACT_APP_FARO_APP_NAME,
  //   REACT_APP_SENTRY_PROJECT_NAME,
  //   REACT_APP_RELEASE
  // } = getEnv();

  // if (REACT_APP_SENTRY_URL) {
  //   Sentry.init({
  //     dsn: REACT_APP_SENTRY_URL,
  //     release: `${REACT_APP_SENTRY_PROJECT_NAME}@${REACT_APP_RELEASE}`,
  //     integrations: [
  //       Sentry.browserProfilingIntegration(),
  //       Sentry.browserTracingIntegration(),
  //       Sentry.replayIntegration()
  //     ],
  //     // Performance Monitoring
  //     tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  //     profilesSampleRate: 1.0,
  //     replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  //     replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  //   });
  // }

  // if (REACT_APP_PUBLIC_POSTHOG_KEY && REACT_APP_PUBLIC_POSTHOG_HOST) {
  //   posthog.init(REACT_APP_PUBLIC_POSTHOG_KEY, {
  //     api_host: REACT_APP_PUBLIC_POSTHOG_HOST
  //   });
  // }
  // if (REACT_APP_FARO_COLLECTOR_URL && REACT_APP_FARO_APP_NAME) {
  //   initializeFaro({
  //     // required: the URL of the Grafana collector
  //     url: REACT_APP_FARO_COLLECTOR_URL,

  //     // required: the identification label of your application
  //     app: {
  //       name: REACT_APP_FARO_APP_NAME
  //     }
  //   });
  // }

  if (currentUser) {
    if (VERSION && VERSION === "saas") {
      const currentOrganization = currentUser.currentOrganization;

      if (currentOrganization) {
        if (!currentOrganization.onboardingDone) {
          return (
            <OnboardingLayout>
              <OnboardingRoutes currentUser={currentUser} />
            </OnboardingLayout>
          );
        }

        if (!currentOrganization.contactRemaining) {
          return (
            <>
              <MainLayout currentUser={currentUser}>
                <AccountSuspended />;
              </MainLayout>
            </>
          );
        }
      }
    }

    return (
      <MainLayout currentUser={currentUser}>
        <SettingsRoutes />
        <TagRoutes />
        <FormRoutes />
        <SegmentRoutes />
        <ContactRoutes />
        <ProductRoutes />
        <InsightRoutes />
        <WelcomeRoutes currentUser={currentUser} />
        {pluginLayouts(currentUser)}
        {pluginRouters()}
        <BrowserRoutes>
          <Route
            key="/confirmation"
            path="/confirmation"
            element={<UserConfirmationComponent />}
          />
        </BrowserRoutes>
      </MainLayout>
    );
  }

  return (
    <>
      <BrowserRoutes>
        <Route
          key="/confirmation"
          path="/confirmation"
          element={<UserConfirmationComponent />}
        />
      </BrowserRoutes>
      {VERSION && VERSION === "saas" ? <SAASAuthRoutes /> : <OSAuthRoutes />}
    </>
  );
};

const Routes = ({ currentUser }: { currentUser: IUser }) => {
  return (
    <Router>
      <BrowserRoutes>
        <Route
          key="/unsubscribe"
          path="/unsubscribe"
          element={<UnsubscribeComponent />}
        />
      </BrowserRoutes>
      {renderRoutes(currentUser)}
    </Router>
  );
};

export default withCurrentUser(Routes);
