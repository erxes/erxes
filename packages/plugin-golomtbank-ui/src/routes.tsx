import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import queryString from "query-string";
import { Route, Routes, useLocation } from 'react-router-dom';


const ConfigsList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ConfigList" */ "./config/containers/List"
    )
);

const ConfigsListComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <ConfigsList queryParams={queryParams} />;
};
const GolomtbankAccounts = asyncComponent(() =>
  import(/* webpackChunkName: "Settings CreateGolomtbank" */ './components/CorporateGateway')
);
;

const MenuComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <GolomtbankAccounts queryParams={queryParams} />;
};

const routes = () => {
  return (
    
    <Routes>
    
      <Route path="/erxes-plugin-golomtbank/config" element={<ConfigsListComponent />} />
       <Route
        key="/erxes-plugin-golomtbank/accounts"
        path="/erxes-plugin-golomtbank/accounts"
        element={<MenuComponent />}
      />
    </Routes>
     
  );
};

export default routes;
