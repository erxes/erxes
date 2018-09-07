import * as React from 'react';
import { Route } from 'react-router-dom';
import { Home } from './containers';

const routes = () => <Route path="/settings/deals/" component={Home} />;

export default routes;
