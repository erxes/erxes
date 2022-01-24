import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const KnowledgeBase = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './containers/KnowledgeBase')
);

const routes = () => <Route path='/knowledgeBase/' component={KnowledgeBase} />;

export default routes;
