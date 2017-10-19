import React from 'react';
import { Route } from 'react-router-dom'
import { Main } from './styles';
import MainLayout from './components/MainLayout'
import Inbox from '../inbox/components/Inbox'
import routes from '../settings/routes'

const Routes = () => (

  <Main>
    <Route exact path="/" component={() => <MainLayout content={<Inbox title="Hi" />} />} />
    <Route exact path="/inbox" component={() => <MainLayout content={<Inbox title="There" />} />} />
    {routes.map((route, index) => (
      <Route
        key={index}
        path={route.path}
        exact={route.exact}
        component={() => <MainLayout content={<route.main />} />}
      />
    ))}
  </Main>
);

export default Routes;
