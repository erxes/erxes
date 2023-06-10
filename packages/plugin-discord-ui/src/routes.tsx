import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { Authorization } from './containers/Authorization';

const CreateDiscord = asyncComponent(() =>
  import(/* webpackChunkName: "Settings CreateDiscord" */ './containers/Form')
);

const createDiscord = () => {
  return <CreateDiscord />;
};

const auth = ({ location }) => (
  <Authorization queryParams={queryString.parse(location.search)} />
);

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/settings/integrations/createDiscord"
        exact={true}
        path="/settings/integrations/createDiscord"
        component={createDiscord}
      />
      <Route
        key="/settings/discord-authorization"
        exact={true}
        path="/settings/discord-authorization"
        component={auth}
      />
    </React.Fragment>
  );
};

export default routes;
