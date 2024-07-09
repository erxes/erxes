import BoardSettings from "./settings/boards/routes";
import PurchaseRotes from "./purchases/routes";
import React from "react";

const routes = () => {
  return (
    <>
      <PurchaseRotes />
      <BoardSettings />
    </>
  );
};

export default routes;
