import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const GeneralSettings = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Automation General Settings" */ './settings/general/containers'
    ),
);

const BotsSettings = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Automation Bots Settings" */ './settings/bots/containers'
    ),
);

const Details = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "AutomationDetails" */ './containers/forms/EditAutomation'
    ),
);

const List = asyncComponent(
  () => import(/* webpackChunkName: "AutomationsList" */ './containers/List'),
);

const generalSettings = ({ location, history }) => {
  return (
    <GeneralSettings
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const botsSettings = ({ location, history }) => {
  return (
    <BotsSettings
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const details = ({ match, location }) => {
  const id = match.params.id;
  const queryParams = queryString.parse(location.search);

  return <Details id={id} queryParams={queryParams} />;
};

const list = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <List queryParams={queryParams} />;
};

const routes = () => {
  return (
    <>
      <Route
        path="/settings/automations/general"
        component={generalSettings}
        exact
      />
      <Route path="/settings/automations/bots" component={botsSettings} exact />

      <Route
        key="/automations/details/:id"
        exact={true}
        path="/automations/details/:id"
        component={details}
      />
      <Route
        path="/automations"
        exact={true}
        key="/automations"
        component={list}
      />
    </>
  );
};

export default routes;
