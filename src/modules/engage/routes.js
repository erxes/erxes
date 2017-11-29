import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MessageList, MessageForm } from './containers';

const routes = () => [
  <Route
    key="/engage/home"
    exact
    path="/engage"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);

      return <MessageList queryParams={queryParams} />;
    }}
  />,

  <Route
    key="/engage/messages/create"
    exact
    path="/engage/messages/create"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return <MessageForm kind={queryParams.kind} />;
    }}
  />,

  <Route
    key="/engage/messages/edit"
    exact
    path="/engage/messages/edit/:_id"
    component={({ match }) => {
      return <MessageForm messageId={match.params._id} />;
    }}
  />
];

export default routes;
