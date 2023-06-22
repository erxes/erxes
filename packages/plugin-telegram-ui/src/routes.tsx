import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const CreateTelegram = asyncComponent(() =>
  import(/* webpackChunkName: "Settings CreateTelegram" */ './containers/Form')
);

const createTelegram = () => {
  return <CreateTelegram />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/settings/integrations/createTelegram"
        exact={true}
        path="/settings/integrations/createTelegram"
        component={createTelegram}
      />
    </React.Fragment>
  );
};

export default routes;
