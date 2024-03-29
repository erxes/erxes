import queryString from "query-string";
import React from "react";
import { Route, Routes } from "react-router-dom";

import CarList from "./containers/CarsList";
import CarDetails from "./containers/detail/CarDetails";
import CarSection from "./components/common/CarSection";
import { useLocation, useParams } from "react-router-dom";

const Details = () => {
  const { id } = useParams();

  return <CarDetails id={id} />;
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
