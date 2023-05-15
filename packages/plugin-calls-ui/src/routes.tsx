import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Widget = asyncComponent(() =>
  import(/* webpackChunkName: "Widget - Calls" */ './containers/Widget')
);

const calls = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <Widget typeId={type} history={history} />;
};

const routes = () => {
  return <Route path="/calls/" component={calls} />;
};

export default routes;
