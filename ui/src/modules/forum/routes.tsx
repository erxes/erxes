import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Forum = asyncComponent(() => import('./components/Forum'));

const routes = () => <Route path="/forum/" component={Forum} />;

export default routes;
