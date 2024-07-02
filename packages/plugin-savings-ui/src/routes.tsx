import { Route, Routes, useLocation, useParams } from "react-router-dom";

import MainSettings from "./settings/components/MainSettings";
import React from "react";
import Settings from "./settings/containers/Settings";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const ContractList = asyncComponent(
  () =>
    import(/* webpackChunkName: "ContractList" */ "./contracts/containers/List")
);

const ContractDetails = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ContractDetails" */ "./contracts/containers/detail/ContractDetails"
    )
);
const PeriodLockDetails = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PeriodLockDetails" */ "./periodLocks/containers/PeriodLockDetails"
    )
);

const TransactionList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "TransactionList" */ "./transactions/containers/TransactionsList"
    )
);
const PeriodLockList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PeriodLockList" */ "./periodLocks/containers/PeriodLocksList"
    )
);

const ContractTypesList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ContractTypesList" */ "./contractTypes/containers/ContractTypesList"
    )
);
const ContractTypeDetails = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ContractTypeDetails" */ "./contractTypes/containers/ContractTypeDetails"
    )
);

const ContractLists = () => {
  const location = useLocation();

  return (
    <ContractList
      queryParams={queryString.parse(location.search)}
      isDeposit={false}
    />
  );
};

const DepositLists = () => {
  const location = useLocation();

  return (
    <ContractList
      queryParams={queryString.parse(location.search)}
      isDeposit={true}
    />
  );
};

const DetailsOfContract = () => {
  const { id } = useParams();

  return <ContractDetails id={id} />;
};

const PeriodLockDetail = () => {
  const { id } = useParams();

  return <PeriodLockDetails id={id} />;
};

const TransactionLists = () => {
  const location = useLocation();

  return <TransactionList queryParams={queryString.parse(location.search)} />;
};

const PeriodLockLists = () => {
  const location = useLocation();

  return <PeriodLockList queryParams={queryString.parse(location.search)} />;
};

const ContractTypesLists = () => {
  const location = useLocation();

  return <ContractTypesList queryParams={queryString.parse(location.search)} />;
};

const ContractTypeDetail = () => {
  const { id } = useParams();

  return <ContractTypeDetails id={id} />;
};

const MainSettingsComponent = () => {
  return <Settings components={MainSettings}></Settings>;
};

const SavingRoutes = () => {
  return (
    <Routes>
      <Route
        key="/erxes-plugin-saving/contract-list"
        path="/erxes-plugin-saving/contract-list"
        element={<ContractLists />}
      />
      <Route
        key="/erxes-plugin-saving/deposit-list"
        path="/erxes-plugin-saving/deposit-list"
        element={<DepositLists />}
      />
      <Route
        path="/erxes-plugin-saving/contract-details/:id"
        element={<DetailsOfContract />}
      />
      <Route
        path="/erxes-plugin-saving/transaction-list"
        element={<TransactionLists />}
      />
      <Route
        path="/erxes-plugin-saving/contract-types"
        element={<ContractTypesLists />}
      />
      <Route
        path="/erxes-plugin-saving/contract-type-details/:id"
        element={<ContractTypeDetail />}
      />

      <Route
        path="/erxes-plugin-saving/saving-settings"
        element={<MainSettingsComponent />}
      />
      <Route
        path="/erxes-plugin-saving/periodLock-list"
        element={<PeriodLockLists />}
      />
      <Route
        path="/erxes-plugin-saving/periodLock-details/:id"
        element={<PeriodLockDetail />}
      />
    </Routes>
  );
};

export default SavingRoutes;
