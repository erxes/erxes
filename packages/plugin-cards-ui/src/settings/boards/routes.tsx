import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import React from "react";
import { Route, Routes } from "react-router-dom";

const Home = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings - Board Home"  */ "./containers/Home")
);

const TicketHome = () => {
  return <Home type="ticket" title="Ticket" />;
};

const TaskHome = () => {
  return <Home type="task" title="Task" />;
};

const routes = () => (
  <Routes>
    <Route path="/settings/boards/ticket" element={<TicketHome />} />
    <Route path="/settings/boards/task" element={<TaskHome />} />
  </Routes>
);

export default routes;
