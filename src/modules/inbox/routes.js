import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import Inbox from '../inbox/containers/Inbox';

const routes = () => [
  <Route
    exact
    key="index"
    path="/"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      const _id = queryParams._id;

      return <Inbox _id={_id} queryParams={queryParams} />;
    }}
  />,

  <Route
    exact
    key="inbox"
    path="/inbox"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      const _id = queryParams._id;

      return <Inbox _id={_id} queryParams={queryParams} />;
    }}
  />
];

export default routes;
