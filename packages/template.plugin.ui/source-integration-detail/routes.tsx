import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Create{Name} = asyncComponent(() =>
  import(/* webpackChunkName: "Settings Create{Name}" */ './containers/Form')
);

const create{Name} = () => {
  return <Create{Name} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/settings/integrations/create{Name}"
        exact={true}
        path="/settings/integrations/create{Name}"
        component={create{Name}}
      />
    </React.Fragment>
  );
};

export default routes;
