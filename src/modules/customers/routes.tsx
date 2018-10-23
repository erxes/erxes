import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { CustomerDetails, CustomersList } from './containers';

const routes = () => {
  const detail = ({ match, location }) => {
    const queryParams = queryString.parse(location.search);
    const id = match.params.id;

    return <CustomerDetails id={id} queryParams={queryParams} />;
  };

  const list = ({ location }) => {
    const queryParams = queryString.parse(location.search);
    return <CustomersList queryParams={queryParams} location={location} />;
  };

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
