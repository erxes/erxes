import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../layout/components';
import { ChannelList } from './components';

const routes = () => (
  <Route path='/settings/channels/' component={() => <MainLayout content={<ChannelList />} />} />
);

export default routes;
