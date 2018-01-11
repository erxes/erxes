import React from 'react';
import { Route } from 'react-router-dom';
import { Settings } from './components';

const routes = () => <Route path="/settings/main/" component={Settings} />;

export default routes;
