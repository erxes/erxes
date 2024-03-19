import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const Insight = asyncComponent(
  () => import(/* webpackChunkName: "InsightList" */ './containers/Insight'),
);

const InsightList = ({ location, history }) => {
  return (
    <Insight
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const InsightRoutes = () => {
  return (
    <React.Fragment>
      <Route path="/insight" component={InsightList} />
    </React.Fragment>
  );
};

export default InsightRoutes;
