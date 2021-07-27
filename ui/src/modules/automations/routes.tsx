import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Blank = asyncComponent(() =>
  import(/* webpackChunkName: "AutomationBlank" */ './containers/Blank')
);

const Details = asyncComponent(() =>
  import(/* webpackChunkName: "AutomationDetails" */ './containers/Details')
);

const List = asyncComponent(() =>
  import(/* webpackChunkName: "AutomationsList" */ './containers/List')
);

const details = ({ match }) => {
  const id = match.params.id;

  return <Details id={id} />;
};

const blank = ({}) => {
  return <Blank />;
};

const list = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  localStorage.setItem('erxes_contact_url', 'companies');

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
        key="/automations/blank"
        exact={true}
        path="/automations/blank"
        component={blank}
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
