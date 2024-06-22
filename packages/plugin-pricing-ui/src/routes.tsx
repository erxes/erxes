import React from "react";
import { Route, Routes } from "react-router-dom";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

const Plans = asyncComponent(
  () => import(/* webpackChunkName: "Settings List - Pricing" */ "./page/Plans")
);

const PlanCreate = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings List - Pricing - Create Discount" */ "./page/PlanCreate"
    )
);

const PlanEdit = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings List - Pricing - Edit Discount" */ "./page/PlanEdit"
    )
);

const routes = () => {
  return (
    <Routes>
      <Route path="/pricing/plans" key="/pricing/plans" element={<Plans />} />

      <Route
        path="/pricing/plans/create"
        key="/pricing/plans/create"
        element={<PlanCreate />}
      />

      <Route
        path="/pricing/plans/edit/:id"
        key="/pricing/plans/edit/"
        element={<PlanEdit />}
      />
    </Routes>
  );
};

export default routes;
