import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Mobinet" */ './containers/List')
);

const mobinets = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type, viewType } = queryParams;

  return <List typeId={type} history={history} viewType={viewType} />;
};

const routes = () => {
  return (
    <>
      <Route path="/mobinet/" component={mobinets} />
    </>
  );
};

export default routes;
