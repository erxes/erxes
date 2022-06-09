import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: 'Sales Plans' */ './containers/List')
);

const routes = () => <Route path="/sales-plans" component={List} />;

export default routes;
