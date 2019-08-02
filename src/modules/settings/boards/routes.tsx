import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Board Home" */ './containers/Home')
);

const DealHome = () => {
  return <Home type="deal" title="Deal" />;
};

const TicketHome = () => {
  return <Home type="ticket" title="Ticket" />;
};

const TaskHome = () => {
  return <Home type="task" title="Task" />;
};

const GrowthHackHome = () => {
  return <Home type="growthHack" title="Growth hack" />;
};

const routes = () => (
  <React.Fragment>
    <Route path="/settings/boards/deal" component={DealHome} />
    <Route path="/settings/boards/ticket" component={TicketHome} />
    <Route path="/settings/boards/task" component={TaskHome} />
    <Route path="/settings/boards/growthHack" component={GrowthHackHome} />
  </React.Fragment>
);

export default routes;
