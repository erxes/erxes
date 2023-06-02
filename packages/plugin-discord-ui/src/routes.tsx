import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const CreateDiscord = asyncComponent(() =>
  import(/* webpackChunkName: "Settings CreateDiscord" */ './containers/Form')
);

const createDiscord = () => {
  return <CreateDiscord />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/settings/integrations/createDiscord"
        exact={true}
        path="/settings/integrations/createDiscord"
        component={createDiscord}
      />
    </React.Fragment>
  );
};

export default routes;
