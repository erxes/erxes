import { IRouterProps } from 'modules/common/types';
import queryString from 'query-string';
import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { Inbox } from './containers';

const index = () => {
  return <Redirect to="/inbox" />;
};

const inbox = (props: IRouterProps) => {
  return (
    <Inbox
      history={props.history}
      queryParams={queryString.parse(props.location.search)}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route exact={true} path="/" key="index" render={index} />
      <Route exact={true} key="inbox" path="/inbox" render={inbox} />
    </React.Fragment>
  );
};

export default routes;
