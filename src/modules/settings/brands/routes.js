import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/components';
import { BrandList } from './containers';

const routes = () => (
  <div>
    <Route
      path="/settings/brands/"
      component={() => {
        return <MainLayout content={<BrandList queryParams={{}} />} />;
      }}
    />
  </div>
);

export default routes;
