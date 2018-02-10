import React from 'react';
import { Route } from 'react-router-dom';
import { Boards } from './containers';

const routes = () => <Route path="/settings/boards/" component={Boards} />;

export default routes;
