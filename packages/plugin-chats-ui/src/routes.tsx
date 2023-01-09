import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const chat = asyncComponent(() =>
  import(/* webpackChunkName: "Plugin chat" */ './containers/Chat')
);

const routes = () => {
  return (
    <React.Fragment>
      <Route
        exact={true}
        path="/erxes-plugin-chat"
        key="/erxes-plugin-chat"
        component={chat}
      />
    </React.Fragment>
  );
};

export default routes;
