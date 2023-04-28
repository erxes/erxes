import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

import { options } from './options';
const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Board Home"  */ './containers/Home')
);

const DealHome = () => {
  return <Home type="deal" title="Deal" />;
};

const PurchaseHome = () => {
  return <Home type="purchase" title="Purchase" options={options} />;
};

const TicketHome = () => {
  return <Home type="ticket" title="Ticket" />;
};

const TaskHome = () => {
  return <Home type="task" title="Task" />;
};

const routes = () => (
  <React.Fragment>
    <Route path="/settings/boards/deal" component={DealHome} />
    <Route path="/settings/boards/purchase" component={PurchaseHome} />
    <Route path="/settings/boards/ticket" component={TicketHome} />
    <Route path="/settings/boards/task" component={TaskHome} />
  </React.Fragment>
);

export default routes;
