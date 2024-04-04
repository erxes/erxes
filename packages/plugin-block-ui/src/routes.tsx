import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const PackageList = asyncComponent(() =>
  import(/* webpackChunkName: "PackageList" */ './containers/PackageList')
);

const list = ({ location, history }) => {
  return (
    <PackageList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/block/list"
        exact={true}
        path="/block/list"
        component={list}
      />
    </React.Fragment>
  );
};

export default routes;
