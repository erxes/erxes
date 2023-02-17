import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const PerformList = asyncComponent(() =>
  import(/* webpackChunkName: "PerformList" */ '../performs/containers/List')
);

const SeriesNumberPrint = asyncComponent(() =>
  import(
    /* webpackChunkName: "processes perfrom - SeriesPrint" */ './containers/SeriesPrint'
  )
);

const performList = ({ location, history }) => {
  return (
    <PerformList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const seriesNumberPrint = ({ match }) => {
  const id = match.params.id;

  return <SeriesNumberPrint id={id} />;
};

const routes = () => {
  return (
    <>
      <Route
        path="/processes/performanceList"
        exact={true}
        key="/processes/performanceList"
        component={performList}
      />
      <Route
        path="/processes/seriesNumberPrint/:id"
        exact={true}
        key="/processes/seriesNumberPrint/:id"
        component={seriesNumberPrint}
      />
    </>
  );
};

export default routes;
