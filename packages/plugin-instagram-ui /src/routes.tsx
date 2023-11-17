import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { Authorization } from './containers/Authorization';

const CreateFacebook = asyncComponent(() =>
  import(/* webpackChunkName: "Settings CreateFacebook" */ './containers/Form')
);

const createFacebook = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  const callBack = () => {
    history.push('/settings/integrations/');
  };

  return <CreateFacebook callBack={callBack} kind={queryParams.kind} />;
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
  </React.Fragment>
);

export default routes;
