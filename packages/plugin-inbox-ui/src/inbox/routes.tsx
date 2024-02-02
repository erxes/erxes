import { Route, Routes } from 'react-router-dom';

import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const InboxComponent = asyncComponent(
  () => import(/* webpackChunkName: "InboxCore"   */ './containers/InboxCore'),
);

const Index = ({ location }) => {
  // return <Redirect to={`/inbox/index${location.search}`} />;
};

const Inbox = (props: IRouterProps) => {
  return (
    <InboxComponent
      history={props.history}
      queryParams={queryString.parse(props.location.search)}
    />
  );
};

const routes = () => {
  return (
    <Routes>
      {/* <Route path="/inbox" key="inbox" element={<Index />} /> */}
      {/* <Route
        path="/inbox/index"
        key="inbox/index"
        element={<Inbox />}
      /> */}
    </Routes>
  );
};

export default routes;
