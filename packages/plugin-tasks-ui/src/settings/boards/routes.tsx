import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Home = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings - Board Home"  */ './containers/Home')
);

const TaskHome = () => {
  return <Home type="task" title="Task" />;
};

const routes = () => (
  <React.Fragment>
    <Route path="/settings/boards/task" component={TaskHome} />
  </React.Fragment>
);

export default routes;
