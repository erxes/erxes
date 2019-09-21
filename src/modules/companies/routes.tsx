import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const CompanyDetails = asyncComponent(() =>
  import(/* webpackChunkName: "CompanyDetails" */ './containers/detail/CompanyDetails')
);

const CompaniesList = asyncComponent(() =>
  import(/* webpackChunkName: "CompaniesList" */ './containers/CompaniesList')
);

const details = ({ match }) => {
  const id = match.params.id;

  return <CompanyDetails id={id} />;
};

const list = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <CompaniesList queryParams={queryParams} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        path="/contacts/companies/details/:id"
        exact={true}
        key="/contacts/companies/details/:id"
        component={details}
      />

      <Route
        path="/contacts/companies"
        exact={true}
        key="/contacts/companies"
        component={list}
      />
    </React.Fragment>
  );
};

export default routes;
