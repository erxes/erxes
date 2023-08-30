import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Meetings" */ './containers/List')
);

const meetings = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { meetingId } = queryParams;
  const routePath = location.pathname.split('/').slice(-1)[0];

  return (
    <List
      meetingId={meetingId}
      searchFilter={location.search}
      history={history}
      queryParams={queryParams}
      route={routePath}
    />
  );
};

const routes = () => {
  return <Route path="/meetings" component={props => meetings({ ...props })} />;
};

export default routes;
