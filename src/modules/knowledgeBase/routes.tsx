import asyncComponent from 'modules/common/components/AsyncComponent';
import * as React from 'react';
import { Route } from 'react-router-dom';

const KnowledgeBase = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './containers/KnowledgeBase')
);

const routes = () => <Route path="/knowledgeBase/" component={KnowledgeBase} />;

export default routes;
