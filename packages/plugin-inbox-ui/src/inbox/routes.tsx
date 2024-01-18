import { Redirect, Route } from 'react-router-dom';

import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const InboxComponent = asyncComponent(
  () => import(/* webpackChunkName: "InboxCore"   */ './containers/InboxCore'),
);

const index = ({ location }) => {
  return <Redirect to={`/inbox/index${location.search}`} />;
};

const inbox = (props: IRouterProps) => {
  return (
    <InboxComponent
      history={props.history}
      queryParams={queryString.parse(props.location.search)}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route exact={true} path="/inbox" key="inbox" render={index} />
      <Route
        exact={true}
        path="/inbox/index"
        key="inbox/index"
        render={inbox}
      />
    </>
  );
};

export default routes;
