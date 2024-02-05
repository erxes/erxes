import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  Navigate,
} from 'react-router-dom';

import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const InboxComponent = asyncComponent(
  () => import(/* webpackChunkName: "InboxCore"   */ './containers/InboxCore'),
);

const Index = () => {
  const location = useLocation();

  return <Navigate replace to={`/inbox/index${location.search}`} />;
};

const Inbox = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <InboxComponent
      history={navigate}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route path="/inbox" key="inbox" element={<Index />} />
      <Route path="/inbox/index" key="inbox/index" element={<Inbox />} />
    </Routes>
  );
};

export default routes;
