import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { TopicList, CategoryList, ArticleList } from './containers';

const routes = () => [
  <Route
    key="/settings/knowledgebase/list"
    exact={true}
    path="/settings/knowledgebase/list"
    component={({ location }) => (
      <TopicList queryParams={queryString.parse(location.search)} />
    )}
  />,

  <Route
    key="/settings/knowledgebase/categories"
    exact={true}
    path="/settings/knowledgebase/categories"
    component={({ location }) => (
      <CategoryList queryParams={queryString.parse(location.search)} />
    )}
  />,

  <Route
    key="/settings/knowledgebase/articles"
    exact={true}
    path="/settings/knowledgebase/articles"
    component={({ location }) => (
      <ArticleList queryParams={queryString.parse(location.search)} />
    )}
  />
];

export default routes;
