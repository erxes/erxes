import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Timeclocks" */ './containers/List')
);

const timeclocks = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { date } = queryParams;
  // const date = new Date().toDateString();
  console.log(date);
  // console.log(date);

  return (
    <List selectedDate={date} history={history} queryParams={queryParams} />
  );
};

const routes = () => {
  return <Route path="/timeclocks/" component={timeclocks} />;
};

export default routes;
