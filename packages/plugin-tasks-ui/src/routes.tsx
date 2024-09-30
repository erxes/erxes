import BoardSettings from "./settings/boards/routes";
import TaskRotes from "./tasks/routes";
import React from "react";

const routes = () => {
  return (
    <>
      <TaskRotes />
      <BoardSettings />
    </>
  );
};

export default routes;
