import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import DashboardDetail from './containers/DashboardDetail';
import DashboardList from './containers/DashboardList';
import ExplorePage from './containers/Explore';

const dashboards = ({ location, history }) => {
  return (
    <DashboardList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const dashboardDetail = ({ match, history }) => {
  const id = match.params.id;

  return <DashboardDetail id={id} history={history} />;
};

const explorePage = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <ExplorePage queryParams={queryParams} history={history} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route key="/" exact={true} path="/" component={dashboards} />
      <Route
        key="/detail"
        exact={true}
        path="/details/:id"
        component={dashboardDetail}
      />

      <Route
        key="/explore"
        exact={true}
        path="/explore"
        component={explorePage}
      />
    </React.Fragment>
  );
};

export default routes;
