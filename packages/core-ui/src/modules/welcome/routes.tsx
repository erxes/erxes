import { Route, Routes } from "react-router-dom";

import React from "react";
import WelcomeOs from "./container/WelcomeOs";
import WelcomeSaas from "./components/WelcomeSaas";
import { getVersion } from "@erxes/ui/src/utils/core";

const routes = ({ currentUser }) => {
  const { VERSION } = getVersion();

  return (
    <Routes>
      <Route
        key="/welcome"
        path="/welcome"
        element={
          VERSION && VERSION === "saas" ? (
            <WelcomeSaas currentUser={currentUser} />
          ) : (
            <WelcomeOs currentUser={currentUser} />
          )
        }
      />
    </Routes>
  );
};

export default routes;
