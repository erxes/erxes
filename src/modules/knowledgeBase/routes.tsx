import * as React from 'react';
import { Route } from 'react-router-dom';
import { KnowledgeBase } from './containers';

const routes = () => <Route path="/knowledgeBase/" component={KnowledgeBase} />;

export default routes;
