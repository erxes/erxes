import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Meetings" */ './containers/List')
);

const MyMeetings = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Meetings" */ './components/myMeetings/MyMeetings'
  )
);

const meetings = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { meetingId } = queryParams;
  const routePath = location.pathname.split('/').slice(-1)[0];

  return (
    <List
      meetingId={meetingId}
      history={history}
      queryParams={queryParams}
      route={routePath}
    />
  );
};

const myMeetings = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const routePath = location.pathname.split('/').slice(-1)[0];

  return (
    <MyMeetings history={history} queryParams={queryParams} route={routePath} />
  );
};

const routes = () => {
  return (
    <>
      <Route
        path="/meetings/myCalendar"
        component={props => meetings({ ...props })}
        exact
      />
      <Route
        path="/meetings/myMeetings"
        component={props => myMeetings({ ...props })}
        exact
      />
    </>
  );
};

export default routes;
