import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Create = asyncComponent(() =>
  import(/* webpackChunkName: "Automations" */ './containers/Automations')
);

const create = () => {
  return <Create />;
};

const routes = () => {
  return (
    <>
      <Route
        key="/automations/create"
        exact={true}
        path="/automations/create"
        component={create}
      />
    </>
  );
};

export default routes;
