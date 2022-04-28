import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import ContractList from './contracts/containers/List';
import queryString from 'query-string';

const Home = asyncComponent(() => (
  <ContractList
    queryParams={queryString.parse(location.search)}
    history={history}
  />
));

const LoanRoutes = () => (
  <Route path="/erxes-plugin-loan/home" component={Home} />
);

export default LoanRoutes;
