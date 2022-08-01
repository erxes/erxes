import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const WorkList = asyncComponent(() =>
  import(/* webpackChunkName: "WorkList" */ './containers/WorkList')
);

const OverallWorkList = asyncComponent(() =>
  import(
    /* webpackChunkName: "OverallWorkList" */ './containers/OverallWorkList'
  )
);

const PerformList = asyncComponent(() =>
  import(/* webpackChunkName: "PerformList" */ './containers/PerformList')
);

const PerformsByOverallWorkId = asyncComponent(() =>
  import(
    /* webpackChunkName: "PerformList" */ './containers/PerformsByOverallWorkId'
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

const performList = ({ location, history }) => {
  return (
    <PerformList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const performsByOverallWorkId = ({ location, history }) => {
  return (
    <PerformsByOverallWorkId
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
      <Route
        path="/processes/performances"
        exact={true}
        key="/processes/performances"
        component={performsByOverallWorkId}
      />
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
