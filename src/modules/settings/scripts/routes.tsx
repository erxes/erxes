import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - List Scripts" */ './containers/List')
);

const scripts = ({ location }) => {
  return <List queryParams={queryString.parse(location.search)} />;
};

const routes = () => <Route path="/settings/scripts/" component={scripts} />;

export default routes;
