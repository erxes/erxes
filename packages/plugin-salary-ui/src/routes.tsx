import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(
  () =>
    import(/* webpackChunkName: "List - Salaries" */ './containers/SalaryList'),
);

const salaryList = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <List typeId={type} history={history} queryParams={queryParams} />;
};

const routes = () => {
  return (
    <>
      <Route path="/salaries" component={salaryList} />;
      <Route path="/profile/salaries" component={salaryList} />
    </>
  );
};

export default routes;
