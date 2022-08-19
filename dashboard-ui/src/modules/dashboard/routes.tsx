import queryString from 'query-string';
import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import DashboardDetail from './containers/DashboardDetail';
import ExplorePage from './containers/Explore';
import InitialData from './containers/InitialDatas';

const dashboardDetail = ({ match, history, location }) => {
  const id = match.params.id;
  const queryParams = queryString.parse(location.search);

  return (
    <DashboardDetail id={id} history={history} queryParams={queryParams} />
  );
};

const explorePage = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <ExplorePage queryParams={queryParams} history={history} />;
};

const initialData = ({ location, history }) => {
  return (
    <InitialData
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <BrowserRouter basename="/dashboard/front">
      <React.Fragment>
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

        <Route
          key="/reports"
          exact={true}
          path="/reports"
          component={initialData}
        />
      </React.Fragment>
    </BrowserRouter>
  );
};

export default routes;
