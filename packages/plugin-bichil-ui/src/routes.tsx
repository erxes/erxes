import App from './App';
import React from 'react';
import { Route } from 'react-router-dom';

const routes = () => {
  return <Route path="/bichils/" component={App} />;
};

export default routes;
