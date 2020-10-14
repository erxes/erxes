import React from 'react';
import { Route } from 'react-router-dom';
import Main from './components/Calendar';

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/calendar" exact={true} key="/calendar" component={Main} />
    </React.Fragment>
  );
};

export default routes;
