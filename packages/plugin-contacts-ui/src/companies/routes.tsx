import { Route, Routes, useLocation, useParams } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const CompanyDetails = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CompanyDetail"  */ './containers/detail/CompanyDetails'
    ),
);

const CompaniesList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CompaniesList" */ './containers/CompaniesList'
    ),
);

const Details = () => {
  const { id = '' } = useParams();

  return <CompanyDetails id={id} />;
};

const List = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  localStorage.setItem('erxes_contact_url', 'companies');

  return <CompaniesList queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/companies/details/:id"
        key="/companies/details/:id"
        element={<Details />}
      />

      <Route path="/companies" key="/companies" element={<List />} />
    </Routes>
  );
};

export default routes;
