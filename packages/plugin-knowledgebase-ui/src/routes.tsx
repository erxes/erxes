import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const KnowledgeBase = asyncComponent(
  () =>
    import(/* webpackChunkName: "KnowledgeBase" */ "./containers/KnowledgeBase")
);

const KbComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return (
    <KnowledgeBase
      location={location}
      navigate={navigate}
      queryParams={queryParams}
    />
  );
};

const routes = () => (
  <Routes>
    <Route path="/knowledgeBase/" element={<KbComponent />} />
  </Routes>
);

export default routes;
