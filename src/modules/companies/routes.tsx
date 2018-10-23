import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { CompaniesList, CompanyDetails } from './containers';

const routes = () => {
  const details = ({ match, location }) => {
    const queryParams = queryString.parse(location.search);
    const id = match.params.id;

    return <CompanyDetails id={id} queryParams={queryParams} />;
  };

  const list = ({ location }) => {
    const queryParams = queryString.parse(location.search);

    return <CompaniesList location={location} queryParams={queryParams} />;
  };

  return (
    <React.Fragment>
      <Route
        path="/companies/details/:id"
        exact={true}
        key="/companies/details/:id"
        component={details}
      />

      <Route path="/companies" exact={true} key="/companies" component={list} />
    </React.Fragment>
  );
};

export default routes;
