import AppProvider, { AppConsumer } from "../../modules/appContext";

import PublicTasks from "../../modules/publicTask/containers/Tasks";
import React from "react";

export default function Category() {
  return (
    <AppProvider>
      <AppConsumer>
        {({ currentUser }: any) => {
          return <PublicTasks currentUser={currentUser} />;
        }}
      </AppConsumer>
    </AppProvider>
  );
}
