import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Widget = asyncComponent(() =>
  import(/* webpackChunkName: "Widget - Calls" */ './containers/Widget')
);

const calls = ({ location, history, currentUser }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <Widget typeId={type} history={history} currentUser={currentUser} />;
};

const routes = ({ currentUser }) => {
  return (
    <Route
      path="/calls/"
      component={props => calls({ ...props, currentUser })}
    />
  );
};

export default withCurrentUser(routes);
