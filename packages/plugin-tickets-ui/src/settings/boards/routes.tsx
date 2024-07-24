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

const routes = () => (
  <Routes>
    <Route path="/settings/boards/ticket" element={<TicketHome />} />
  </Routes>
);

export default routes;
