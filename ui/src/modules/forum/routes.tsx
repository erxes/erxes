import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Forum = asyncComponent(() =>
  import(/* webpackChunkName: "Forum" */ './containers/Forum')
);

const Forums = ({ location }) => {
  const queryParams = queryString.parse(location.search);
  return <Forum queryParams={queryParams} currentTopicId={queryParams.id} />;
};

const routes = () => <Route path="/forum/" component={Forums} />;

export default routes;
