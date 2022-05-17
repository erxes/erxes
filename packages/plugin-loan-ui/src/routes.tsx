import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import Settings from './settings/containers/Settings';

const ContractList = asyncComponent(() =>
  import(/* webpackChunkName: "ContractList" */ './contracts/containers/List')
);

const ContractDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "ContractDetails" */ './contracts/containers/detail/ContractDetails'
  )
);
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

const TransactionList = asyncComponent(() =>
  import(
    /* webpackChunkName: "TransactionList" */ './transactions/containers/TransactionsList'
  )
);
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
const ContractTypeDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "ContractTypeDetails" */ './contractTypes/containers/ContractTypeDetails'
  )
);

const contractLists = ({ location, history }) => {
  return (
    <ContractList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const detailsOfContract = ({ match }) => {
  const id = match.params.id;

  return <ContractDetails id={id} />;
};

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

const transactionLists = ({ location, history }) => {
  return (
    <TransactionList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

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

const contractTypeDetail = ({ match }) => {
  const id = match.params.id;

  return <ContractTypeDetails id={id} />;
};

const undueSettings = ({ location, history }) => {
  return <Settings components={undueSettings}></Settings>;
};

const holidaySettings = ({ location, history }) => {
  return <Settings components={holidaySettings}></Settings>;
};

const LoanRoutes = () => {
  return (
    <React.Fragment>
      <Route path="/contract-list" component={contractLists} />
      <Route path="/contract-details/:id" component={detailsOfContract} />
      <Route path="/collateral-list" component={collateralLists} />
      <Route path="/transaction-list" component={transactionLists} />
      <Route path="/insurance-types" component={insuranceTypesLists} />
      <Route path="/settings/contract-types" component={contractTypesLists} />
      <Route path="/contract-type-details/:id" component={contractTypeDetail} />
      <Route path="/undue-settings" component={undueSettings} />
      <Route path="/settings/holiday-settings" component={holidaySettings} />
      <Route path="/adjustment-list" component={adjustmentLists} />
      {/* <Route path="/adjustment-details/:id" component={adjustmentDetail} /> */}
    </React.Fragment>
  );
};

export default LoanRoutes;
