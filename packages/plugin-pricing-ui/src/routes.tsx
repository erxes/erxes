import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const discounts = asyncComponent(() =>
  import(/* webpackChunkName: "Settings List - Pricing" */ './page/Discounts')
);

const discountCreate = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - Pricing - Create Discount" */ './page/DiscountCreate'
  )
);

const discountEdit = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - Pricing - Edit Discount" */ './page/DiscountEdit'
  )
);

const routes = () => {
  return (
    <React.Fragment>
      <Route
        exact={true}
        path="/pricing/discounts"
        key="/pricing/discounts"
        component={discounts}
      />

      <Route
        exact={true}
        path="/pricing/discounts/create"
        key="/pricing/discounts/create"
        component={discountCreate}
      />

      <Route
        exact={true}
        path="/pricing/discounts/edit/:id"
        key="/pricing/discounts/edit/"
        component={discountEdit}
      />
    </React.Fragment>
  );
};

export default routes;
