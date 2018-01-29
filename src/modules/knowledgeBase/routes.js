import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { TopicList, CategoryList, ArticleList } from './containers';

const routes = () => [
  <Route
    key="/knowledgeBase/list"
    exact
    path="/knowledgeBase/list"
    component={({ location }) => {
      return <TopicList queryParams={queryString.parse(location.search)} />;
    }}
  />,

  <Route
    key="/knowledgeBase/categories"
    exact
    path="/knowledgeBase/categories"
    component={({ location }) => {
      return <CategoryList queryParams={queryString.parse(location.search)} />;
    }}
  />,

  <Route
    key="/knowledgeBase/articles"
    exact
    path="/knowledgeBase/articles"
    component={({ location }) => {
      return <ArticleList queryParams={queryString.parse(location.search)} />;
    }}
  />
];

export default routes;
