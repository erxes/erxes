import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

const CategoryList = asyncComponent(() =>
  import(/* webpackChunkName: "List - Category" */ './modules/categories/containers/List')
);

const Car = asyncComponent(() =>
  import(/* webpackChunkName: "List - Car" */ './modules/categories/components/Car')
);

const Component = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return <CategoryList location={location} navigate={navigate} />;
};

const CarComponent = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  return <Car location={location} navigate={navigate} />
}

const routes = () => {
  // return <Route path="/cmss/" component={cmss} />;
  <Routes>
  <Route
    key="/cms/categories"
    path="/cms/categories"
    element={<Component />}
  />

  <Route
    key="/cms/car"
    path="/cms/car"
    element={<CarComponent />}
  />
</Routes>
};



export default routes;
