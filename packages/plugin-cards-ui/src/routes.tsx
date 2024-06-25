import BoardSettings from "./settings/boards/routes";
import GrowthHackingRoutes from "./growthHacks/routes";
import GrowthSettings from "./settings/growthHacks/routes";
import React from "react";
import TaskRoutes from "./tasks/routes";
import TicketRoutes from "./tickets/routes";

const routes = () => {
  return (
    <>
      <TaskRoutes />
      <TicketRoutes />
      <GrowthHackingRoutes />
      <GrowthSettings />
      <BoardSettings />
    </>
  );
};

export default routes;
