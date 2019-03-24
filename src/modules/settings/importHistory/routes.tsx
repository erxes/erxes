import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';

const Histories = asyncComponent(() =>
  import(/* webpackChunkName: "Settings Histories" */ './containers/Histories')
);

const importHistories = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <Histories queryParams={queryParams} />;
};

const routes = () => (
  <Route path="/settings/importHistories/" component={importHistories} />
);

export default routes;
