import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const WorkList = asyncComponent(() =>
  import(/* webpackChunkName: "WorkList" */ './containers/WorkList')
);

const workList = ({ location, history }) => {
  console.log('calling routes ...');
  return (
    <WorkList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <Route
      path="/processes/works"
      exact={true}
      key="/processes/works"
      component={workList}
    />
  );
};

export default routes;
