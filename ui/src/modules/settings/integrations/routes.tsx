import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import { Authorization } from './containers/Authorization';

const Store = asyncComponent(() =>
  import(/* webpackChunkName: "Settings Store" */ './containers/Store')
);

const CreateMessenger = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings CreateMessenger" */ './containers/messenger/Create'
  )
);

const EditMessenger = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings EditMessenger" */ './containers/messenger/Edit'
  )
);

const CreateFacebook = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings CreateFacebook" */ './containers/facebook/Form'
  )
);

const CreateGmail = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings CreateGmail" */ './containers/gmail/Form'
  )
);

const createMessenger = ({ location }) => {
  return <CreateMessenger queryParams={queryString.parse(location.search)} />;
};

const createFacebook = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  const callBack = () => {
    history.push('/settings/integrations/');
  };

  return <CreateFacebook callBack={callBack} kind={queryParams.kind} />;
};

const createGmail = ({ history }) => {
  const callBack = () => {
    history.push('/settings/integrations/');
  };

  return <CreateGmail callBack={callBack} />;
};

const editMessenger = ({ match }) => {
  return <EditMessenger integrationId={match.params._id} />;
};

const twitterCallback = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <Store history={history} queryParams={queryParams} />;
};

const store = ({ location }) => (
  <Store queryParams={queryString.parse(location.search)} />
);

const auth = ({ location }) => (
  <Authorization queryParams={queryString.parse(location.search)} />
);

const routes = () => (
  <React.Fragment>
    <Route
      key="/settings/integrations/createMessenger"
      exact={true}
      path="/settings/integrations/createMessenger"
      component={createMessenger}
    />

    <Route
      key="/settings/integrations/editMessenger/:_id"
      exact={true}
      path="/settings/integrations/editMessenger/:_id"
      component={editMessenger}
    />

    <Route
      key="/settings/integrations/createFacebook"
      exact={true}
      path="/settings/integrations/createFacebook"
      component={createFacebook}
    />

    <Route
      key="/settings/integrations/createGmail"
      exact={true}
      path="/settings/integrations/createGmail"
      component={createGmail}
    />

    <Route
      key="/service/oauth/twitter_callback"
      path="/service/oauth/twitter_callback"
      component={twitterCallback}
    />

    <Route
      key="/settings/authorization"
      exact={true}
      path="/settings/authorization"
      component={auth}
    />

    <Route
      key="/settings/integrations"
      exact={true}
      path="/settings/integrations"
      component={store}
    />
  </React.Fragment>
);

export default routes;
