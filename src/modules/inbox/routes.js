import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Inbox } from '../inbox/containers';

const routes = () => [
  <Route exact path="/" key="index" render={() => <Redirect to="/inbox" />} />,

  <Route exact key="inbox" path="/inbox" component={Inbox} />
];

export default routes;
