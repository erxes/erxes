import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { router } from '@erxes/ui/src/utils';
import queryString from 'query-string';
import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import Chart from './components/Chart';
const routes = () => {
  return <Route path="/reports" component={Chart} />;
};

export default routes;
