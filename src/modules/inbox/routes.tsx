import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { Inbox } from './containers';

const routes = () => {
  const index = () => {
    return <Redirect to="/inbox" />;
  };

  return (
    <React.Fragment>
      <Route exact={true} path="/" key="index" render={index} />
      <Route exact={true} key="inbox" path="/inbox" component={Inbox} />
    </React.Fragment>
  );
};

export default routes;
