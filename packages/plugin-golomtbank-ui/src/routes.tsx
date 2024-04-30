import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const CreateGolomtbank = asyncComponent(() =>
  import(/* webpackChunkName: "Settings CreateGolomtbank" */ './containers/Form')
);

const createGolomtbank = () => {
  return <CreateGolomtbank />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/settings/integrations/createGolomtbank"
        exact={true}
        path="/settings/integrations/createGolomtbank"
        component={createGolomtbank}
      />
    </React.Fragment>
  );
};

export default routes;
