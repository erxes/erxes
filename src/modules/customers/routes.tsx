import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const CustomerDetails = asyncComponent(() =>
  import(/* webpackChunkName: "CustomerDetails" */ './containers/CustomerDetails')
);

const CustomersList = asyncComponent(() =>
  import(/* webpackChunkName: "CustomersList" */ './containers/CustomersList')
);

const contacts = () => {
  return <Redirect to="/contacts/customers/all" />;
};

const detail = ({ match }) => {
  const id = match.params.id;

  return <CustomerDetails id={id} />;
};

const list = ({ match, location }) => {
  const queryParams = queryString.parse(location.search);
  const type = match.params.type;
  const finalType = type !== 'visitors' ? '' : type;

  return <CustomersList queryParams={queryParams} type={finalType} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route key="/contacts" exact={true} path="/contacts" render={contacts} />

      <Route
        key="/contacts/customers/details/:id"
        exact={true}
        path="/contacts/customers/details/:id"
        component={detail}
      />

      <Route
        key="/contacts/customers/:type"
        exact={true}
        path="/contacts/customers/:type"
        component={list}
      />
    </React.Fragment>
  );
};

export default routes;
