import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { KnowledgeBase } from './containers';

const routes = () => (
  <Route
    path="/knowledgeBase/"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);

      return <KnowledgeBase queryParams={queryParams} />;
    }}
  />
);

export default routes;
