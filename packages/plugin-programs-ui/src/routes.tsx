import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import ProgramList from "./containers/List";

const List = () => {
  const location = useLocation();

  return <ProgramList queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route key="/programs" path="/programs" element={<List />} />
    </Routes>
  );
};

export default routes;
