import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AutomationsRoutes from "./routes";
import { PluginLayout } from "@erxes/ui/src/styles/main";

const Routes = () => (
  <PluginLayout>
    <Router>
      <AutomationsRoutes />
    </Router>
  </PluginLayout>
);

export default Routes;
