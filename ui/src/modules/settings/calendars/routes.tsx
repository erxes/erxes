import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Calendar Home" */ './containers/Home')
);

const Calendar = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <Home queryParams={queryParams} history={history} />;
};

const ScheduleBase = asyncComponent(() =>
  import(/* webpackChunkName: "Schedule" */ './containers/scheduler/Base')
);

const schedule = ({ match }) => {
  const id = match.params.id;

  return <ScheduleBase accountId={id} />;
};

const CreateSchedulePage = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings CreateSchedulePage" */ './containers/scheduler/PageForm'
  )
);

const createPage = ({ location, match }) => {
  return (
    <CreateSchedulePage
      queryParams={queryString.parse(location.search)}
      accountId={match.params.id}
    />
  );
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

    <Route
      path="/settings/schedule/createPage/:id"
      exact={true}
      key="/settings/schedule/createPage/:id"
      component={createPage}
    />
  </React.Fragment>
);

export default routes;
