import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Plugin exm" */ './containers/Home')
);

const Detail = asyncComponent(() =>
  import(/* webpackChunkName: "List - SyncSaas" */ './containers/Form')
);

const List = ({ history, location }) => {
  return (
    <Home history={history} queryParams={queryString.parse(location.search)} />
  );
};

const edit = ({ history, location, match }) => {
  return (
    <Detail
      _id={match.params.id}
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const add = ({ history, location }) => {
  return (
    <Detail
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const ExmRoutes = () => (
  <React.Fragment>
    <Route path="/erxes-plugin-exm/home" component={List} exact={true} />
    <Route
      path="/erxes-plugin-exm/home/edit/:id"
      component={edit}
      exact={true}
    />
    <Route path="/erxes-plugin-exm/home/add" component={add} exact={true} />
  </React.Fragment>
);

export default ExmRoutes;
