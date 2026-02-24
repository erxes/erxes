import React from "react";
import { RouteObject } from "react-router-dom";
import { Sidebar } from "erxes-ui/components/sidebar";

import CustomersPage from '../../pages/msdynamic/CustomersPage';

export const routes: RouteObject[] = [
  {
    path: "/msdynamic/customers",
    element: <CustomersPage />,
  },
];

export const navigation = (
  <Sidebar>
      MS 
  </Sidebar>
);