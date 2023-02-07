import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const CreateZalo = asyncComponent(() =>
  import(/* webpackChunkName: "Settings CreateZalo" */ './containers/Form')
);

const createZalo = () => {
  return <CreateZalo />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/settings/integrations/createZalo"
        exact={true}
        path="/settings/integrations/createZalo"
        component={createZalo}
      />
    </React.Fragment>
  );
};

export default routes;
