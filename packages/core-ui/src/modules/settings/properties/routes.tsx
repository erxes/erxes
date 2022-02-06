import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Properties = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings Properties" */ './containers/Properties'
  )
);

const properties = ({ location }) => {
  const queryParams = queryString.parse(location.search);
  return <Properties queryParams={queryParams} />;
};

const routes = () => (
  <Route path="/settings/properties/" component={properties} />
);

export default routes;
