import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/containers';
import { TopicList } from './containers';

const routes = () => [
  <Route
    key="/settings/knowledgebase/list"
    exact={true}
    path="/settings/knowledgebase/list"
    component={() => <MainLayout content={<TopicList queryParams={{}} />} />}
  />
];

export default routes;
