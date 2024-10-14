import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { Route } from "react-router-dom";
import GeneralSettings from "./components/GeneralSettings";
import CustomerSettings from "./components/CustomerSettings";
import DepositSettings from "./components/DepositSettings";
import LoanSettings from "./components/LoanSettings";
import SavingSettings from "./components/SavingSettings";
import React from "react";

const Settings = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings" */ "./containers/Settings")
);


const GeneralSetting = () => {
  return <Settings component={GeneralSettings} configCode="POLARIS" />;
};

const CustomerSetting = () => {
  return <Settings component={CustomerSettings} configCode="POLARIS" />;
};

const DepositSetting = () => {
  return <Settings component={DepositSettings} configCode="POLARIS" />;
};

const LoanSetting = () => {
  return <Settings component={LoanSettings} configCode="POLARIS" />;
};

const SavingSetting = () => {
  return <Settings component={SavingSettings} configCode="POLARIS" />;
};


const routes = () => {
  return (
    <>
      <Route
        key="/erxes-plugin-polaris-polaris/settings/general"
        path="/erxes-plugin-sync-polaris/settings/general"
        element={<GeneralSetting />}
      />
      <Route
        key="/erxes-plugin-polaris-polaris/settings/customer"
        path="/erxes-plugin-sync-polaris/settings/customer"
        element={<CustomerSetting />}
      />
      <Route
        key="/erxes-plugin-polaris-polaris/settings/deposit"
        path="/erxes-plugin-sync-polaris/settings/deposit"
        element={<DepositSetting />}
      />
      <Route
        key="/erxes-plugin-polaris-polaris/settings/loan"
        path="/erxes-plugin-sync-polaris/settings/loan"
        element={<LoanSetting />}
      />
      <Route
        key="/erxes-plugin-polaris-polaris/settings/saving"
        path="/erxes-plugin-sync-polaris/settings/saving"
        element={<SavingSetting />}
      />
    </>
  );
};

export default routes;
