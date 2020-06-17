import queryString from 'query-string';
import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import DashboardDetail from './containers/DashboardDetail';
import ExplorePage from './containers/Explore';

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
    <BrowserRouter basename="/dashboard">
      <React.Fragment>
        <Route
          key='/detail'
          exact={true}
          path='/details/:id'
          component={dashboardDetail}
        />

        <Route
          key='/explore'
          exact={true}
          path='/explore'
          component={explorePage}
        />
      </React.Fragment>
    </BrowserRouter>
  );
};

export default routes;