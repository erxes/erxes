import AppProvider, { AppConsumer } from "../../modules/appContext";

import React from "react";
import Tasks from "../../modules/publicTask/containers/Tasks";

export default function Category() {
  return (
    <AppProvider>
      <AppConsumer>
        {({ currentUser }: any) => {
          return <Tasks currentUser={currentUser} />;
        }}
      </AppConsumer>
    </AppProvider>
  );
}
