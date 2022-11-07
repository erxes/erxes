import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Riskassessments" */ './containers/List')
);

const riskAssessments = ({ history, location }) => {
  return <List history={history} queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <>
      <Route path="/riskassessments" component={riskAssessments} />
    </>
  );
};

export default routes;
