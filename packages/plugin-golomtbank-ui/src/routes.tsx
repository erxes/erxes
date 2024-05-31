import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import queryString from "query-string";
import { Route, Routes, useLocation } from 'react-router-dom';

const GolomtbankConfig = asyncComponent(() =>
  import(/* webpackChunkName: "Settings CreateGolomtbank" */ './configs/containers/List')
);
const GolomtbankAccounts = asyncComponent(() =>
  import(/* webpackChunkName: "Settings CreateGolomtbank" */ './components/CorporateGateway')
);
const golomtbankConfig = () => {
  return <GolomtbankConfig />;
};

const MenuComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <GolomtbankAccounts queryParams={queryParams} />;
};

const routes = () => {
  return (
    
    <Routes>
       <Route
        key="/erxes-plugin-golomtbank/configs"
        path="/erxes-plugin-golomtbank/configs"
        Component={golomtbankConfig}
      />
       <Route
        key="/erxes-plugin-golomtbank/accounts"
        path="/erxes-plugin-golomtbank/accounts"
        element={<MenuComponent />}
      />
    </Routes>
     
  );
};

export default routes;
