import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { purchaseOptions } from "./options";

const Home = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings - Board Home"  */ "./containers/Home")
);

const TicketHome = () => {
  return <Home type="purchase" title="Ticket" options={purchaseOptions} />;
};

const routes = () => (
  <Routes>
    <Route path="/settings/boards/purchase" element={<TicketHome />} />
  </Routes>
);

export default routes;
