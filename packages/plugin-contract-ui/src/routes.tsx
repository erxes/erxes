import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const ContractList = asyncComponent(() =>
  import(/* webpackChunkName: "PackageList" */ './containers/ContractList')
);

const list = ({ location, history }) => {
  return (
    <ContractList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/contracts/list"
        exact={true}
        path="/contracts/list"
        component={list}
      />
    </React.Fragment>
  );
};

export default routes;
