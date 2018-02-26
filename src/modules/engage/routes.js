import React from 'react';
import { Route } from 'react-router-dom';
import { MessageList, AutoAndManualForm } from './containers';

const routes = () => [
  <Route key="/engage/home" exact path="/engage" component={MessageList} />,

  <Route
    key="/engage/messages/create"
    exact
    path="/engage/messages/create"
    component={() => {
      return <AutoAndManualForm />;
    }}
  />,

  <Route
    key="/engage/messages/edit"
    exact
    path="/engage/messages/edit/:_id"
    component={({ match }) => {
      return <AutoAndManualForm messageId={match.params._id} />;
    }}
  />
];

export default routes;
