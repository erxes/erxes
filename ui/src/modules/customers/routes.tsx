import { Redirect, Route } from 'react-router-dom';

import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';

const CustomerDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "CustomerDetails" */ './containers/CustomerDetails'
  )
);

const CustomersList = asyncComponent(() =>
  import(/* webpackChunkName: "CustomersList" */ './containers/CustomersList')
);

const contacts = () => {
  const lastVisited = localStorage.getItem('erxes_contact_url') || 'visitor';

  if (lastVisited === 'companies') {
    return <Redirect to={lastVisited} />;
  }

  return <Redirect to={`/contacts/${lastVisited}`} />;
};

const detail = ({ match }) => {
  const id = match.params.id;

  return <CustomerDetails id={id} />;
};

const list = ({ match, location }) => {
  const queryParams = queryString.parse(location.search);
  const type = match.params.type;

  localStorage.setItem('erxes_contact_url', type);

  return <CustomersList queryParams={queryParams} type={type} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route key="/contacts" exact={true} path="/contacts" render={contacts} />

      <Route
        key="/contacts/details/:id"
        exact={true}
        path="/contacts/details/:id"
        component={detail}
      />

      <Route
        key="/contacts/:type"
        exact={true}
        path="/contacts/:type"
        component={list}
      />
    </React.Fragment>
  );
};

export default routes;
