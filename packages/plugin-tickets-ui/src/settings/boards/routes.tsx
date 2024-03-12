import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Home = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings - Board Home"  */ './containers/Home')
);

const TicketHome = () => {
  return <Home type="ticket" title="Ticket" />;
};

const routes = () => (
  <React.Fragment>
    <Route path="/settings/boards/ticket" component={TicketHome} />
  </React.Fragment>
);

export default routes;
