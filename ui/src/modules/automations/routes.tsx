import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Form = asyncComponent(() =>
  import(
    /* webpackChunkName: "AutomationBlank" */ './containers/forms/AutomationForm'
  )
);

const Details = asyncComponent(() =>
  import(/* webpackChunkName: "AutomationDetails" */ './containers/Details')
);

const AutomationsList = asyncComponent(() =>
  import(/* webpackChunkName: "AutomationsList" */ './containers/List')
);

const details = ({ match }) => {
  const id = match.params.id;

  return <Details id={id} />;
};

const form = ({}) => {
  return <Form />;
};

const list = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  localStorage.setItem('erxes_contact_url', 'companies');

  return <AutomationsList queryParams={queryParams} />;
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
