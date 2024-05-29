import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

const CreateZalo = asyncComponent(() =>
  import(/* webpackChunkName: "Settings CreateZalo" */ './containers/Form')
);

const CreateZaloComponent = () => {
  return <CreateZalo />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        key="/settings/integrations/createZalo"
        path="/settings/integrations/createZalo"
        element={<CreateZaloComponent/>}
      />
    </Routes>
  );
};

export default routes;
