import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import ProductsRoutes from "./routes";

const Routes = () => (
  <Router>
    <ProductsRoutes />
  </Router>
);

export default Routes;
