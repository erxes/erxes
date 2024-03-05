import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { purchaseOptions } from './options';
const Home = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - Board Home"  */ './containers/Home'
    ),
);

const DealHome = () => {
  return <Home type="deal" title="Deal" />;
};

const PurchaseHome = () => {
  return <Home type="purchase" title="Purchase" options={purchaseOptions} />;
};

const TicketHome = () => {
  return <Home type="ticket" title="Ticket" />;
};

const TaskHome = () => {
  return <Home type="task" title="Task" />;
};

const routes = () => (
  <Routes>
    <Route path="/settings/boards/deal" element={<DealHome />} />
    <Route path="/settings/boards/purchase" element={<PurchaseHome />} />
    <Route path="/settings/boards/ticket" element={<TicketHome />} />
    <Route path="/settings/boards/task" element={<TaskHome />} />
  </Routes>
);

export default routes;
