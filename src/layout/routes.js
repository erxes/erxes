import React from 'react';
import { Route } from 'react-router-dom'
import { Main } from './styles';
import MainLayout from './components/MainLayout'
import Inbox from '../inbox/containers/Inbox'
import settingsRoutes from '../settings/routes'

const Routes = () => (

  <Main>
    <Route exact path="/" component={() => <MainLayout content={<Inbox title="Hi" />} />} />
    <Route exact path="/inbox" component={() => <MainLayout content={<Inbox title="There" />} />} />
    {settingsRoutes.map((route, index) => (
      <Route
        key={index}
        path={route.path}
        exact={route.exact}
        component={() => <MainLayout content={<route.content />} />}
      />
    ))}
  </Main>
);

export default Routes;
