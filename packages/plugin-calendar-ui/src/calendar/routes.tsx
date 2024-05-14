import Main from "./containers/Main";
import React from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import Schedule from "./components/scheduler/Index";
import queryString from "query-string";

const MainComponent = () => {
  const location = useLocation();
  return <Main queryParams={queryString.parse(location.search)} />;
};

const ScheduleComponent = () => {
  const { slug } = useParams();

  return <Schedule slug={slug || ""} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/calendar" key="/calendar" element={<MainComponent />} />

      <Route
        key="/schedule"
        path="/schedule/:slug"
        element={<ScheduleComponent />}
      />
    </Routes>
  );
};

export default routes;
