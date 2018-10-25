import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { List } from './containers';

const responseTemplates = ({ location }) => {
  return <List queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Route path="/settings/response-templates/" component={responseTemplates} />
);

export default routes;
