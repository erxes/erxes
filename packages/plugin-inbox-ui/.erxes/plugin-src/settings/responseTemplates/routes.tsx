import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Settings" */ './containers/List')
);

const responseTemplates = ({ location }) => {
  return <List queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Route path='/settings/response-templates/' component={responseTemplates} />
);

export default routes;
