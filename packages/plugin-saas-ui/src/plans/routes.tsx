import * as React from 'react';
import { Route } from 'react-router-dom';
import Plans from './containers/Plans';

const routes = () => (
  <>
    <Route
      key="/settings/organizations/"
      exact={true}
      path="/settings/organizations/"
      component={Plans}
    />
  </>
);

export default routes;
