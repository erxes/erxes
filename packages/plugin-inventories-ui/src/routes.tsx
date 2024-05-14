import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import ListComponentDoc from "./safeRemainderDetails/components/PrintDoc";
import ListComponent from "./safeRemainderDetails/components/Print";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useParams, useLocation } from "react-router-dom";

const Remainders = asyncComponent(
  () =>
    import(
      /* webpackChunkName: 'List - LiveRemainders' */ "./remainders/containers/List"
    )
);
const ReserveRems = asyncComponent(
  () =>
    import(
      /* webpackChunkName: 'List - LiveRemainders' */ "./reserveRemainders/containers/List"
    )
);

const SafeRemainders = asyncComponent(
  () =>
    import(
      /* webpackChunkName: 'List - SafeRemainders' */ "./safeRemainders/containers/List"
    )
);

const SafeRemainderDetails = asyncComponent(
  () =>
    import(
      /* webpackChunkName: 'List - SafeRemainders' */ "./safeRemainderDetails/containers/List"
    )
);

const SafeRemainderDetailsPrint = asyncComponent(
  () =>
    import(
      /* webpackChunkName: 'List - SafeRemainders' */ "./safeRemainderDetails/containers/Print"
    )
);

const Transactions = asyncComponent(
  () =>
    import(
      /* webpackChunkName: 'List - Transactions' */ "./transactions/containers/List"
    )
);

const RemaindersLog = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings List - ProductService" */ "./remainders/containers/RemaindersLog"
    )
);

const SafeRemainderDetailsPrintDoc = () => {
  return <SafeRemainderDetailsPrint component={ListComponentDoc} />;
};

const SafeRemainderDetailsPrintComponent = () => {
  return <SafeRemainderDetailsPrint component={ListComponent} />;
};

const RemaindersLogComponent = () => {
  const { id } = useParams();
  const location = useLocation();

  return (
    <RemaindersLog id={id} queryParams={queryString.parse(location.search)} />
  );
};

const ReserveRemsComponent = () => {
  const location = useLocation();

  return <ReserveRems queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/inventories/remainders/"
        key="/inventories/remainders/"
        element={<Remainders />}
      />

      <Route
        path="/inventories/reserve-remainders/"
        key="/inventories/reserve-remainders/"
        element={<ReserveRemsComponent />}
      />

      <Route
        path="/inventories/safe-remainders/"
        key="/inventories/safe-remainders/"
        element={<SafeRemainders />}
      />

      <Route
        path="/inventories/safe-remainders/details/:id"
        key="/inventories/safe-remainders/details/:id"
        element={<SafeRemainderDetails />}
      />

      <Route
        path="/inventories/safe-remainders/detailsPrint/:id"
        key="/inventories/safe-remainders/detailsPrint/:id"
        element={<SafeRemainderDetailsPrintComponent />}
      />
      <Route
        path="/inventories/safe-remainders/detailsPrintDoc/:id"
        key="/inventories/safe-remainders/detailsPrintDoc/:id"
        element={<SafeRemainderDetailsPrintDoc />}
      />

      <Route
        path="/inventories/transactions/"
        key="/inventories/transactions"
        element={<Transactions />}
      />

      <Route
        path="/inventories/remainders-log/"
        key="/inventories/remainders-log"
        element={<RemaindersLogComponent />}
      />
    </Routes>
  );
};

export default routes;
