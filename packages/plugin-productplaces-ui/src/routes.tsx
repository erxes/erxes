import Settings from './containers/Settings';
import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const StageSettings = asyncComponent(() =>
  import(/* webpackChunkName: "StageSettings" */ './components/StageSettings')
);

const StageSetting = () => {
  return (
    <Settings component={StageSettings} configCode="dealsProductsDataPlaces" />
  );
};

const SplitSettings = asyncComponent(() =>
  import(/* webpackChunkName: "SplitSettings" */ './components/SplitSettings')
);

const SplitSetting = () => {
  return (
    <Settings component={SplitSettings} configCode="dealsProductsDataSplit" />
  );
};

const PrintSettings = asyncComponent(() =>
  import(/* webpackChunkName: "PrintSettings" */ './components/PrintSettings')
);

const PrintSetting = () => {
  return (
    <Settings component={PrintSettings} configCode="dealsProductsDataPrint" />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/erxes-plugin-product-places/settings/stage"
        exact={true}
        path="/erxes-plugin-product-places/settings/stage"
        component={StageSetting}
      />
      <Route
        key="/erxes-plugin-product-places/settings/split"
        exact={true}
        path="/erxes-plugin-product-places/settings/split"
        component={SplitSetting}
      />
      <Route
        key="/erxes-plugin-product-places/settings/print"
        exact={true}
        path="/erxes-plugin-product-places/settings/print"
        component={PrintSetting}
      />
    </React.Fragment>
  );
};

export default routes;
