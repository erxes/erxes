import * as React from 'react';
import { Route } from 'react-router-dom';
import { List } from './containers';

const tags = ({ match }) => {
  return <List type={match.params.type} />;
};

const routes = () => {
  return <Route path="/tags/:type" component={tags} />;
};

export default routes;
