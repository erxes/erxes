import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/components';
import { List, Signature } from './containers';

const routes = () => [
  <Route
    key="/settings/emails/"
    path="/settings/emails/"
    component={() => {
      return <MainLayout content={<List queryParams={{}} />} />;
    }}
  />,

  <Route
    key="/settings/emails/signatures"
    path="/settings/emails/signatures"
    component={() => {
      return <MainLayout content={<Signature queryParams={{}} />} />;
    }}
  />
];

export default routes;
