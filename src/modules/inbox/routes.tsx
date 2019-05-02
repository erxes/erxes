import asyncComponent from 'modules/common/components/AsyncComponent';
import { IRouterProps } from 'modules/common/types';
import queryString from 'query-string';
import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';

const Inbox = asyncComponent(() =>
  import(/* webpackChunkName: "Inbox" */ './containers/Inbox')
);

const index = () => {
  return <Redirect to="/inbox/inbox" />;
};

const inboxes = () => {
  return <Redirect to="/inbox/inbox" />;
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
      <Route exact={true} path="/inbox" key="index" render={inboxes} />
      <Route exact={true} key="inbox" path="/inbox/inbox" render={inbox} />
    </React.Fragment>
  );
};

export default routes;
