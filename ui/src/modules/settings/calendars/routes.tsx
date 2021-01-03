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

const schedule = ({ history, location }) => {
  return (
    <ScheduleBase
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const CreateSchedulePage = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings CreateSchedulePage" */ './containers/scheduler/CreatePage'
  )
);

const createPage = ({ history, match }) => {
  return (
    <CreateSchedulePage history={history} accountId={match.params.accountId} />
  );
};

const EditSchedulePage = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings CreateSchedulePage" */ './containers/scheduler/EditPage'
  )
);

const editPage = ({ history, match }) => {
  const { id, accountId } = match.params;

  return (
    <EditSchedulePage history={history} pageId={id} accountId={accountId} />
  );
};

const routes = () => (
  <React.Fragment>
    <Route path="/settings/calendars" component={Calendar} />

    <Route
      path="/settings/schedule"
      exact={true}
      key="/settings/schedule"
      component={schedule}
    />

    <Route
      path="/settings/schedule/create/:accountId"
      exact={true}
      key="/settings/schedule/create/:accountId"
      component={createPage}
    />

    <Route
      path="/settings/schedule/edit/:accountId/:id"
      exact={true}
      key="/settings/schedule/edit:id"
      component={editPage}
    />
  </React.Fragment>
);

export default routes;
