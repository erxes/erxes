import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { Inbox } from './containers';

const routes = () => (
  <React.Fragment>
    <Route exact path="/" key="index" render={() => <Redirect to="/inbox" />} />
    <Route exact key="inbox" path="/inbox" component={Inbox} />
  </React.Fragment>
);

export default routes;
