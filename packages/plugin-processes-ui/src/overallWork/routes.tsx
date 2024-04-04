import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "Processes OverallWorks" */ './containers/List')
);

const Detail = asyncComponent(() =>
  import(
    /* webpackChunkName: "Processes OverallWorkDetail" */ './containers/Detail'
  )
);

const ListComponent = ({ location, history }) => {
  return (
    <List queryParams={queryString.parse(location.search)} history={history} />
  );
};

const DetailComponent = ({ location, history }) => {
  return (
    <Detail
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route
        path="/processes/overallWorks"
        exact={true}
        key="/processes/overallWorks"
        component={ListComponent}
      />
      <Route
        path="/processes/overallWorkDetail"
        exact={true}
        key="/processes/overallWorkDetail"
        component={DetailComponent}
      />
    </>
  );
};

export default routes;
