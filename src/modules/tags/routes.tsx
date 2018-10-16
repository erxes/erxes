import * as React from 'react';
import { Route } from 'react-router-dom';
import { List } from './containers';

const routes = () => {
  const tags = ({ match }) => {
    return <List type={match.params.type} />;
  };

  return <Route path="/tags/:type" component={tags} />;
};

export default routes;
