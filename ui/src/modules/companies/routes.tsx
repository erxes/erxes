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

  localStorage.setItem('erxes_contact_url', 'companies');

  return <CompaniesList queryParams={queryParams} />;
};

const routes = () => {
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
