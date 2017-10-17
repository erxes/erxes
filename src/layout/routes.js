import React from 'react';
import { Route } from 'react-router-dom'
import { Main } from './styles';
import MainLayout from './components/MainLayout'
import Inbox from '../inbox/components/Inbox'

const Routes = () => (
  <Main>
    <Route exact path="/" component={() => <MainLayout content={<Inbox title="Hi" />} />} />
    <Route exact path="/inbox" component={() => <MainLayout content={<Inbox title="There" />} />} />
  </Main>
);

export default Routes;
