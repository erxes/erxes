import * as React from 'react';
import { Route } from 'react-router-dom';
import { Brands } from './containers';

const routes = () => <Route path="/settings/brands/" component={Brands} />;

export default routes;
