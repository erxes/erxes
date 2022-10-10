import App from './App';
import React from 'react';
import { Route } from 'react-router-dom';

const {name}s = () => {
  return <App />;
};

const routes = () => {
  return <Route path='/{name}s/' component={{name}s} />;
};

export default routes;
