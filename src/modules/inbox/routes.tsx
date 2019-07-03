import asyncComponent from 'modules/common/components/AsyncComponent';
import { IRouterProps } from 'modules/common/types';
import queryString from 'query-string';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const Inbox = asyncComponent(() =>
  import(/* webpackChunkName: "Inbox" */ './containers/Inbox')
);

const index = () => {
  return <Redirect to="/inbox/index" />;
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
      <Route exact={true} path="/" key="root" render={index} />
      <Route exact={true} path="/inbox" key="inbox" render={index} />
      <Route
        exact={true}
        path="/inbox/index"
        key="inbox/index"
        render={inbox}
      />
    </React.Fragment>
  );
};

export default routes;
