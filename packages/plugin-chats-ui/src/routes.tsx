import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const chat = asyncComponent(() =>
  import(/* webpackChunkName: "Plugin chat" */ './containers/Chat')
);

const widget = asyncComponent(() =>
  import(/* webpackChunkName: "Plugin chat - Widget" */ './containers/Widget')
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

      <Route
        exact={true}
        path="/erxes-plugin-chat/widget"
        key="/erxes-plugin-chat/widget"
        component={widget}
      />
    </React.Fragment>
  );
};

export default routes;
