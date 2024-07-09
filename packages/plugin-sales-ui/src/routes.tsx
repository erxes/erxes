import BoardSettings from "./settings/boards/routes";
import DealRoutes from "./deals/routes";
import GrowthSettings from "./settings/growthHacks/routes";
import React from "react";

const routes = () => {
  return (
    <>
      <DealRoutes />
      <GrowthSettings />
      <BoardSettings />
    </>
  );
};

export default routes;
