import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const WorkList = asyncComponent(() =>
  import(/* webpackChunkName: "WorkList" */ './containers/WorkList')
);

const OverallWorkList = asyncComponent(() =>
  import(
    /* webpackChunkName: "OverallWorkList" */ './containers/OverallWorklist'
  )
);

const workList = ({ location, history }) => {
  return (
    <WorkList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const overallWorkList = ({ location, history }) => {
  return (
    <OverallWorkList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route
        path="/processes/works"
        exact={true}
        key="/processes/works"
        component={workList}
      />
      <Route
        path="/processes/overallWorks"
        exact={true}
        key="/processes/overallWorks"
        component={overallWorkList}
      />
    </>
  );
};

export default routes;
