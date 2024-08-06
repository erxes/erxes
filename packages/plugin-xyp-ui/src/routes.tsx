import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const Xyps = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <div></div>; 
};

const routes = () => {
  return (
    <Routes>
      <Route path="/xyps/" element={<Xyps />} />
    </Routes>
  );
};

export default routes;
