import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const InboxComponent = asyncComponent(
  () => import(/* webpackChunkName: "InboxCore"   */ "./containers/InboxCore")
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
      navigate={navigate}
      location={location}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route path="/inbox/index" key="inbox/index" element={<Inbox />} />
      <Route path="/inbox" key="inbox" element={<Index />} />
    </Routes>
  );
};

export default routes;
