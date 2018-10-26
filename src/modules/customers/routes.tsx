import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { CustomerDetails, CustomersList } from './containers';

const detail = ({ match }) => {
  const id = match.params.id;

  return <CustomerDetails id={id} />;
};

const list = ({ location }) => {
  const queryParams = queryString.parse(location.search);
  return <CustomersList queryParams={queryParams} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/customers/details/:id"
        exact={true}
        path="/customers/details/:id"
        component={detail}
      />

      <Route key="/customers" exact={true} path="/customers" component={list} />
    </React.Fragment>
  );
};

export default routes;
