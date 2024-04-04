import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

// const List = asyncComponent(() =>
//   import(
//     /* webpackChunkName: "List - Xyps" */ './modules/settings/containers/List'
//   )
// );

const xyps = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <div></div>; //<List typeId={type} history={history} />;
};

const routes = () => {
  return <Route path="/xyps/" component={xyps} />;
};

export default routes;
