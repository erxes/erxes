import * as React from 'react';
import { Route } from 'react-router-dom';
import { Channels } from './containers';

const routes = () => <Route path="/settings/channels/" component={Channels} />;

export default routes;
