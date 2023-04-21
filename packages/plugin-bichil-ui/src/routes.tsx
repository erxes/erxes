import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import App from './App';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const SalaryList = asyncComponent(() =>
  import(/* webpackChunkName: "SalaryList" */ './containers/salary/SalaryList')
);

const salaryList = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  return <SalaryList queryParams={queryParams} history={history} />;
};

const routes = () => {
  return (
    <>
      <Route path="/bichil/salary" component={salaryList} />
      <Route path="/profile/salaries/bichil" component={salaryList} />
    </>
  );
};

export default routes;
