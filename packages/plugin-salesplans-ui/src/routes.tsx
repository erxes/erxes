import React from 'react';
import SalesPlansRoutes from './salesplans/routes';
import ProductsRoutes from './products/routes';

const routes = () => {
  return (
    <>
      <SalesPlansRoutes />
      <ProductsRoutes />
    </>
  );
};

export default routes;
