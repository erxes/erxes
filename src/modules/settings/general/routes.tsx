import * as React from 'react';
import { Route } from 'react-router-dom';
import { List } from './containers';

const routes = () => <Route path="/settings/general/" component={List} />;

export default routes;
