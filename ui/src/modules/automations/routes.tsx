import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Form = asyncComponent(() =>
  import(
    /* webpackChunkName: "AutomationBlank" */ './containers/forms/CreateAutomation'
  )
);

const Details = asyncComponent(() =>
  import(
    /* webpackChunkName: "AutomationDetails" */ './containers/forms/EditAutomation'
  )
);

const List = asyncComponent(() =>
  import(/* webpackChunkName: "AutomationsList" */ './containers/List')
);

const details = ({ match }) => {
  const id = match.params.id;

  return <Details id={id} />;
};

const form = ({ match }) => {
  const type = match.params.type;

  return <Form mainType={type} />;
};

const list = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <List queryParams={queryParams} />;
};

const routes = () => {
  return (
    <>
      <Route
        key="/automations/details/:id"
        exact={true}
        path="/automations/details/:id"
        component={details}
      />
      <Route
        key="/automations/blank/:type"
        exact={true}
        path="/automations/blank/:type"
        component={form}
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
