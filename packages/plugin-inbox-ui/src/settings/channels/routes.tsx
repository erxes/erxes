import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

const Channels = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Channels - Settings" */ "./containers/Channels"
    )
);

const ChannelsComponents = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return <Channels location={location} navigate={navigate} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/settings/channels/" element={<ChannelsComponents />} />
    </Routes>
  );
};

export default routes;
