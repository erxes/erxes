import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { IRouterProps } from '@erxes/ui/src/types';
import queryString from 'query-string';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const InboxComponent = asyncComponent(() =>
  import(/* webpackChunkName: "InboxCore"   */ './containers/InboxCore')
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
    <React.Fragment>
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
