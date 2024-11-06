import BoardSettings from "./settings/boards/routes";
import DealRoutes from "./deals/routes";
import React from "react";

const routes = () => {
  return (
    <>
      <DealRoutes />
      <BoardSettings />
    </>
  );
};

export default routes;
