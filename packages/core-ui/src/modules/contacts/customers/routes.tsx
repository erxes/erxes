import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const CustomerDetails = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerDetails" */ './containers/CustomerDetails'
    ),
);

const CustomersList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CustomersList" */ './containers/CustomersList'
    ),
);

const Contacts = () => {
  const lastVisited = localStorage.getItem('erxes_contact_url') || 'visitor';

  if (lastVisited === 'companies') {
    return <Navigate to={lastVisited} />;
  }

  return <Navigate to={`/contacts/${lastVisited}`} />;
};

const Detail = () => {
  const { id = '' } = useParams();

  return <CustomerDetails id={id} />;
};

const List = () => {
  const location = useLocation();

  const queryParams = queryString.parse(location.search);
  const { type = '' } = useParams();

  localStorage.setItem('erxes_contact_url', type);

  return <CustomersList queryParams={queryParams} type={type} />;
};

const routes = () => {
  return (
    <Routes>
      <Route key="/contacts" path="/contacts" element={<Contacts />} />

      <Route
        key="/contacts/details/:id"
        path="/contacts/details/:id"
        element={<Detail />}
      />

      <Route key="/contacts/:type" path="/contacts/:type" element={<List />} />
    </Routes>
  );
};

export default routes;
