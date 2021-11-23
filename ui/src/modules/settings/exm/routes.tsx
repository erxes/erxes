import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const AsyncHome = asyncComponent(() =>
  import(/* webpackChunkName: "Exm Home" */ './containers/Home')
);

const home = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <AsyncHome queryParams={queryParams} />;
};

const routes = () => {
  return (
    <>
      <Route path="/settings/exm" component={home} />
    </>
  );
};

export default routes;
