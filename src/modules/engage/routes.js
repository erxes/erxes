import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../layout/containers';
import { MessageList, MessageForm } from './containers';

const routes = () => [
  <Route
    key="/engage/home"
    exact
    path="/engage"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);

      return <MainLayout content={<MessageList queryParams={queryParams} />} />;
    }}
  />,

  <Route
    key="/engage/messages/create"
    exact
    path="/engage/messages/create"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return <MainLayout content={<MessageForm kind={queryParams.kind} />} />;
    }}
  />,

  <Route
    key="/engage/messages/edit"
    exact
    path="/engage/messages/edit/:_id"
    component={({ match }) => {
      return (
        <MainLayout content={<MessageForm messageId={match.params._id} />} />
      );
    }}
  />
];

export default routes;
