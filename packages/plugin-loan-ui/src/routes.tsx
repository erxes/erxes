import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const ContractList = asyncComponent(() =>
  import(/* webpackChunkName: "ContractList" */ './Contracts/containers/List')
);

// const ContractDetails = asyncComponent(() =>
//   import(
//     /* webpackChunkName: "ContractDetails" */ './contracts/containers/detail/ContractDetails'
//   )
// );
// const AdjustmentDetails = asyncComponent(() =>
//   import(
//     /* webpackChunkName: "AdjustmentDetails" */ './Adjustments/containers/AdjustmentDetails'
//   )
// );
const CollateralList = asyncComponent(() =>
  import(
    /* webpackChunkName: "CollateralList" */ './collaterals/containers/CollateralsList'
  )
);

// const TransactionList = asyncComponent(() =>
//   import(
//     /* webpackChunkName: "TransactionList" */ './transactions/containers/TransactionsList'
//   )
// );
const AdjustmentList = asyncComponent(() =>
  import(
    /* webpackChunkName: "AdjustmentList" */ './adjustments/containers/AdjustmentsList'
  )
);
const InsuranceTypesList = asyncComponent(() =>
  import(
    /* webpackChunkName: "InsuranceTypesList" */ './insuranceTypes/containers/InsuranceTypesList'
  )
);
const ContractTypesList = asyncComponent(() =>
  import(
    /* webpackChunkName: "ContractTypesList" */ './contractTypes/containers/ContractTypesList'
  )
);
// const ContractTypeDetails = asyncComponent(() =>
//   import(
//     /* webpackChunkName: "ContractTypeDetails" */ './contractTypes/containers/ContractTypeDetails'
//   )
// );
// const Settings = asyncComponent(() =>
//   import(
//     /* webpackChunkName: "UndueSettings" */ './settings/components/UndueSettings'
//   )
// );
// const HolidaySetting = asyncComponent(() =>
//   import(
//     /* webpackChunkName: "HolidaySetting" */ './settings/components/HolidaySettings'
//   )
// );

const contractLists = ({ location, history }) => {
  return (
    <ContractList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

// const contractDetail = ({ match }) => {
//   const id = match.params.id;

//   return <ContractDetails id={id} />;
// };

// const adjustmentDetail = ({ match }) => {
//   const id = match.params.id;

//   return <AdjustmentDetails id={id} />;
// };

const collateralLists = ({ location, history }) => {
  return (
    <CollateralList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

// const transactionLists = ({ location, history }) => {
//   return (
//     <TransactionList
//       queryParams={queryString.parse(location.search)}
//       history={history}
//     />
//   );
// };

const adjustmentLists = ({ location, history }) => {
  return (
    <AdjustmentList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const insuranceTypesLists = ({ location, history }) => {
  return (
    <InsuranceTypesList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const contractTypesLists = ({ location, history }) => {
  return (
    <ContractTypesList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

// const contractTypeDetail = ({ match }) => {
//   const id = match.params.id;

//   return <ContractTypeDetails id={id} />;
// };

// const undueSettings = ({ location, history }) => {
//   return <Settings components={undueSettings}></Settings>;
// };

// const holidaySettings = ({ location, history }) => {
//   return <Settings components={holidaySettings}></Settings>;
// };

// () => ({
//   customerRightSidebarSection: {
//     section: ContractSection,
//   },
//   companyRightSidebarSection: {
//     section: ContractSection,
//   },
//   dealRightSidebarSection: {
//     section: ContractSection,
//   },
// });

const LoanRoutes = () => {
  return (
    <React.Fragment>
      <Route
        key="/contract-list"
        exact={true}
        path="/contract-list"
        component={contractLists}
      />
      {/* <Route
        key="/contract-details/:id"
        exact={true}
        path="/contract-details/:id"
        component={contractDetail}
      /> */}

      <Route
        key="/collateral-list"
        exact={true}
        path="/collateral-list"
        component={collateralLists}
      />
      {/* <Route
        key="/transaction-list"
        exact={true}
        path="/transaction-list"
        component={transactionLists}
      /> */}
      <Route
        key="/insurance-types"
        exact={true}
        path="/insurance-types"
        component={insuranceTypesLists}
      />
      <Route
        key="/contract-types"
        exact={true}
        path="/contract-types"
        component={contractTypesLists}
      />
      {/* <Route
        key="/contract-type-details/:id"
        exact={true}
        path="/contract-type-details/:id"
        component={contractTypeDetail}
      />  */}
      {/* <Route
        key="/undue-settings"
        exact={true}
        path="/undue-settings"
        component={undueSettings}
      /> */}
      {/* <Route
        key="/Holiday-settings"
        exact={true}
        path="/Holiday-settings"
        component={holidaySettings}
      />  */}
      <Route
        key="/adjustment-list"
        exact={true}
        path="/adjustment-list"
        component={adjustmentLists}
      />
      {/* <Route
        key="/adjustment-details/:id"
        exact={true}
        path="/adjustment-details/:id"
        component={adjustmentDetail}
      />  */}
    </React.Fragment>
  );
};

export default LoanRoutes;
