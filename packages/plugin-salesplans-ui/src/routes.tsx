import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const LabelConfigs = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Sales Plans' */ './settings/containers/LabelsList'
  )
);

const labelsList = ({ location, history }) => {
  return (
    <LabelConfigs
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const TimeConfigs = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Sales Plans' */ './settings/containers/TimesList'
  )
);

const timesList = ({ location, history }) => {
  return (
    <TimeConfigs
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const YearPlans = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Sales Plans' */ './plans/containers/YearPlanList'
  )
);

const DayPlans = asyncComponent(() =>
  import(/* webpackChunkName: 'Sales Plans' */ './plans/containers/DayPlanList')
);

const DayLabels = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Sales Plans' */ './dayLabels/containers/DayLabelList'
  )
);

const yearPlanList = ({ location, history }) => {
  return (
    <YearPlans
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const dayPlanList = ({ location, history }) => {
  return (
    <DayPlans
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const dayLabelsList = ({ location, history }) => {
  return (
    <DayLabels
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route
        exact={true}
        path="/salesplans/labels"
        key="/salesplans/labels"
        component={labelsList}
      />
      <Route
        exact={true}
        path="/salesplans/timeframes"
        key="/salesplans/timeframes"
        component={timesList}
      />
      <Route
        exact={true}
        path="/sales-plans/year-plan"
        key="/sales-plans/year-plan"
        component={yearPlanList}
      />
      <Route
        exact={true}
        path="/sales-plans/day-plan"
        key="/sales-plans/day-plan"
        component={dayPlanList}
      />
      <Route
        exact={true}
        path="/sales-plans/day-labels"
        key="/sales-plans/day-labels"
        component={dayLabelsList}
      />
    </>
  );
};

export default routes;
