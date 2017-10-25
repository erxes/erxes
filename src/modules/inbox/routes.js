import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../layout/containers';
import Inbox from '../inbox/containers/Inbox';

const routes = () => [
  <Route
    exact
    key="index"
    path="/"
    component={() => <MainLayout content={<Inbox />} />}
  />,

  <Route
    exact
    key="inbox"
    path="/inbox"
    component={() => <MainLayout content={<Inbox />} />}
  />
];

export default routes;
