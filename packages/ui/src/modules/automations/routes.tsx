import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Details = asyncComponent(() =>
  import(
    /* webpackChunkName: "AutomationDetails" */ './containers/forms/EditAutomation'
  )
);

const List = asyncComponent(() =>
  import(/* webpackChunkName: "AutomationsList" */ './containers/List')
);

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
