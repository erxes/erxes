import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { Histories } from './containers';

const importHistories = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <Histories queryParams={queryParams} />;
};

const routes = () => (
  <Route path="/settings/importHistories/" component={importHistories} />
);

export default routes;
