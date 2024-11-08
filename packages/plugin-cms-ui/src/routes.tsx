import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

const CategoryList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Category" */ './modules/categories/containers/List'
    )
);

const Cms = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Cms" */ './modules/clientportal/containers/Header'
    )
);

const Component = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return <CategoryList location={location} navigate={navigate} />;
};

const CmsComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return <Cms location={location} navigate={navigate} />;
};

const routes = () => (

  <Routes>
    
      <Route
        key='/cms/categories'
        path='/cms/categories'
        element={<Component />}
      />
    
  </Routes>

);

export default routes;
