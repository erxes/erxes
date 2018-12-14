import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { List } from './containers';

const scripts = ({ location }) => {
  return <List queryParams={queryString.parse(location.search)} />;
};

const routes = () => <Route path="/settings/scripts/" component={scripts} />;

export default routes;
