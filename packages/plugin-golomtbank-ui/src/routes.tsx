import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

const GolomtbankConfig = asyncComponent(() =>
  import(/* webpackChunkName: "Settings CreateGolomtbank" */ './config/containers/config')
);

const golomtbankConfig = () => {
  return <GolomtbankConfig />;
};
const routes = () => {
  return (
    <Routes>
       <Route
        key="/erxes-plugin-golomtbank/config"
        path="/erxes-plugin-golomtbank/config"
        Component={golomtbankConfig}
      />
    </Routes>
     
  );
};

export default routes;
