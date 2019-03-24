import asyncComponent from 'modules/common/components/AsyncComponent';
import * as React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "Settings List - Generatel" */ './containers/List')
);

const routes = () => <Route path="/settings/general/" component={List} />;

export default routes;
