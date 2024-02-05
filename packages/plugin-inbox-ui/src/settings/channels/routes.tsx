import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

const Channels = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Channels - Settings" */ './containers/Channels'
    ),
);

const routes = () => {
  return (
    <Routes>
      <Route path="/settings/channels/" element={Channels} />
    </Routes>
  );
};

export default routes;
