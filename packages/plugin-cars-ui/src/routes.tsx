import { Route, Routes } from "react-router-dom";
import { useLocation, useParams } from "react-router-dom";

import CarDetails from "./containers/detail/CarDetails";
import CarList from "./containers/CarsList";
import React from "react";
import queryString from "query-string";

const Details = () => {
  const { id } = useParams();

  return <CarDetails id={id || ""} />;
};

const List = () => {
  const location = useLocation();

  return <CarList queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        key="/erxes-plugin-car/details/:id"
        path="/erxes-plugin-car/details/:id"
        element={<Details />}
      />
      <Route path="/cars" key="/cars" element={<List />} />
    </Routes>
  );
};

export default routes;
