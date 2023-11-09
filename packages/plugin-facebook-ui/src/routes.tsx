import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { Authorization } from './containers/Authorization';

const CreateFacebook = asyncComponent(() =>
  import(/* webpackChunkName: "Settings CreateFacebook" */ './containers/Form')
);

const MessengerBotList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings Messenger Bots" */ './bots/containers/List'
  )
);

const createFacebook = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  const callBack = () => {
    history.push('/settings/integrations/');
  };

  return <CreateFacebook callBack={callBack} kind={queryParams.kind} />;
};

const fbMessengerBots = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <MessengerBotList queryParams={queryParams} />;
};

const auth = ({ location }) => (
  <Authorization queryParams={queryString.parse(location.search)} />
);

const routes = () => (
  <React.Fragment>
    <Route
      key="/settings/integrations/createFacebook"
      exact={true}
      path="/settings/integrations/createFacebook"
      component={createFacebook}
    />

    <Route
      key="/settings/fb-authorization"
      exact={true}
      path="/settings/fb-authorization"
      component={auth}
    />

    <Route
      key="/settings/facebook-messenger-bots"
      exact={true}
      path="/settings/facebook-messenger-bots"
      component={fbMessengerBots}
    />
  </React.Fragment>
);

export default routes;
