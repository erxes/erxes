import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Layout = asyncComponent(() =>
  import(/* webpackChunkName: "List - Forums" */ './components/Layout')
);

const PageDetails = asyncComponent(() =>
  import(/* webpackChunkName: "CustomerDetails" */ './containers/Pages/Detail')
);

const layout = ({ history }) => {
  return <Layout history={history} />;
};

const pageDetail = ({ match }) => {
  const id = match.params.id;

  return <PageDetails id={id} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/forums" component={layout} />

      <Route
        key="/forum/pages/:id"
        exact={true}
        path="/forum/pages/:id"
        component={pageDetail}
      />
    </React.Fragment>
  );
};

export default routes;
