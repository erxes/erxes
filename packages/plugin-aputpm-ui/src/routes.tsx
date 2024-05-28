import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - List aputpm" */ './safetyTips/containers/List'
  )
);

const list = ({ location, history }) => {
  return (
    <List queryParams={queryString.parse(location.search)} history={history} />
  );
};

const routes = () => (
  <>
    <Route path="/settings/safety_tips" exact={true} component={list} />
  </>
);

export default routes;
