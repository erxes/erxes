import React from 'react';
import { Route } from 'react-router-dom';

const saas = ({ _history, _location }) => {
  return <div>12312</div>;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/saas" exact={true} component={saas} />
    </React.Fragment>
  );
};

export default routes;
