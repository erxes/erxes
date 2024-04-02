import queryString from "query-string";
import React from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import Settings from "./settings/containers/Settings";
import HolidaySettings from "./settings/components/HolidaySettings";
import UndueSettings from "./settings/components/UndueSettings";
import MainSettings from "./settings/components/MainSettings";

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

const CollateralList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CollateralList" */ "./collaterals/containers/CollateralsList"
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
const InsuranceTypesList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "InsuranceTypesList" */ "./insuranceTypes/containers/InsuranceTypesList"
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

const ClassificationList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ContractTypeDetails" */ "./classificationHistory/containers/ClassificationList"
    )
);

const ContractLists = () => {
  const location = useLocation();

  return <ContractList queryParams={queryString.parse(location.search)} />;
};

const DetailsOfContract = () => {
  const { id } = useParams();

  return <ContractDetails id={id} />;
};

const PeriodLockDetail = () => {
  const { id } = useParams();

  return <PeriodLockDetails id={id} />;
};

const CollateralLists = () => {
  const location = useLocation();

  return <CollateralList queryParams={queryString.parse(location.search)} />;
};

const TransactionLists = () => {
  const location = useLocation();

  return <TransactionList queryParams={queryString.parse(location.search)} />;
};

const PeriodLockLists = () => {
  const location = useLocation();

  return <PeriodLockList queryParams={queryString.parse(location.search)} />;
};

const InsuranceTypesLists = () => {
  const location = useLocation();

  return (
    <InsuranceTypesList queryParams={queryString.parse(location.search)} />
  );
};

const ContractTypesLists = () => {
  const location = useLocation();

  return <ContractTypesList queryParams={queryString.parse(location.search)} />;
};

const ClassificationHistoryList = () => {
  const location = useLocation();

  return (
    <ClassificationList queryParams={queryString.parse(location.search)} />
  );
};

const ContractTypeDetail = () => {
  const { id } = useParams();

  return <ContractTypeDetails id={id} />;
};

const UndueSettingsComponent = () => {
  return <Settings components={UndueSettings}></Settings>;
};

const MainSettingsComponent = () => {
  return <Settings components={MainSettings} />;
};

const HolidaySettingsComponent = () => {
  return <Settings components={HolidaySettings}></Settings>;
};

const LoanRoutes = () => {
  return (
    <Routes>
      <Route
        key="/erxes-plugin-loan/contract-list"
        path="/erxes-plugin-loan/contract-list"
        element={<ContractLists />}
      />
      <Route
        path="/erxes-plugin-loan/contract-details/:id"
        element={<DetailsOfContract />}
      />
      <Route
        path="/erxes-plugin-loan/collateral-list"
        element={<CollateralLists />}
      />
      <Route
        path="/erxes-plugin-loan/transaction-list"
        element={<TransactionLists />}
      />
      <Route
        path="/erxes-plugin-loan/insurance-types"
        element={<InsuranceTypesLists />}
      />
      <Route
        path="/erxes-plugin-loan/contract-types"
        element={<ContractTypesLists />}
      />
      <Route
        path="/erxes-plugin-loan/contract-type-details/:id"
        element={<ContractTypeDetail />}
      />
      <Route
        path="/erxes-plugin-loan/undue-settings"
        element={<UndueSettingsComponent />}
      />
      <Route
        path="/erxes-plugin-loan/holiday-settings"
        element={<HolidaySettingsComponent />}
      />
      <Route
        path="/erxes-plugin-loan/main-settings"
        element={<MainSettingsComponent />}
      />
      <Route
        path="/erxes-plugin-loan/periodLock-list"
        element={<PeriodLockLists />}
      />
      <Route
        path="/erxes-plugin-loan/periodLock-details/:id"
        element={<PeriodLockDetail />}
      />
      <Route
        path="/erxes-plugin-loan/classificationHistory"
        element={<ClassificationHistoryList />}
      />
    </Routes>
  );
};

export default LoanRoutes;
