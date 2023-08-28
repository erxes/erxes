import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const PerformList = asyncComponent(() =>
  import(/* webpackChunkName: "PerformList" */ '../performs/containers/List')
);

const performList = ({ location, history }) => {
  return (
    <PerformList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route
        path="/processes/performanceList"
        exact={true}
        key="/processes/performanceList"
        component={performList}
      />
    </>
  );
};

export default routes;
