import App from './App';
import React from 'react';
import { Route } from 'react-router-dom';

const plugins = () => {
  return <App />;
};

const routes = () => {
  return <Route path="/plugins/" component={plugins} />;
};

export default routes;
