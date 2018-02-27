import React from 'react';
import { Route } from 'react-router-dom';
import { List } from './components';

const routes = () => <Route path="/forms" component={List} />;

export default routes;
