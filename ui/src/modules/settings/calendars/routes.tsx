import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Calendar Home" */ './containers/Home')
);

const ScheduleBase = asyncComponent(() =>
  import(/* webpackChunkName: "Schedule" */ './containers/scheduler/Base')
);

const Calendar = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <Home queryParams={queryParams} history={history} />;
};

const schedule = ({ match }) => {
  const id = match.params.id;

  return <ScheduleBase accountId={id} />;
};

const routes = () => (
  <React.Fragment>
    <Route path="/settings/calendars" component={Calendar} />

    <Route
      path="/settings/schedule/:id"
      exact={true}
      key="/settings/schedule/:id"
      component={schedule}
    />
  </React.Fragment>
);

export default routes;
