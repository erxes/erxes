import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../../layout/containers';
import { TopicList, CategoryList, ArticleList } from './containers';

const routes = () => [
  <Route
    key="/settings/knowledgebase/list"
    exact={true}
    path="/settings/knowledgebase/list"
    component={({ location }) => (
      <MainLayout
        content={<TopicList queryParams={queryString.parse(location.search)} />}
      />
    )}
  />,

  <Route
    key="/settings/knowledgebase/categories"
    exact={true}
    path="/settings/knowledgebase/categories"
    component={({ location }) => (
      <MainLayout
        content={
          <CategoryList queryParams={queryString.parse(location.search)} />
        }
      />
    )}
  />,

  <Route
    key="/settings/knowledgebase/articles"
    exact={true}
    path="/settings/knowledgebase/articles"
    component={({ location }) => (
      <MainLayout
        content={
          <ArticleList queryParams={queryString.parse(location.search)} />
        }
      />
    )}
  />
];

export default routes;
