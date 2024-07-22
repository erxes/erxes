import BoardSettings from "./settings/boards/routes";
import TicketRotes from "./tickets/routes";
import React from "react";

const routes = () => {
  return (
    <>
      <TicketRotes />
      <BoardSettings />
    </>
  );
};

export default routes;
