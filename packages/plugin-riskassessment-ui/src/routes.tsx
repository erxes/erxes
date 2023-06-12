import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const RiskIndicators = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Riskindicators" */ './indicator/containers/List'
  )
);

const ConfigList = asyncComponent(() =>
  import(/* webpackChunkName: "List - Configs" */ './configs/containers/List')
);

const RiskAssessments = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Riskassessments" */ './assessments/containers/List'
  )
);

const Operations = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Operations" */ './operations/containers/List'
  )
);
const Groups = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Groups" */ './indicator/groups/containers/List'
  )
);
const Plans = asyncComponent(() =>
  import(/* webpackChunkName: "List - Groups" */ './plan/containers/List')
);

const PlanForm = asyncComponent(() =>
  import(/* webpackChunkName: "List - Groups" */ './plan/containers/Form')
);

const riskIndicators = props => {
  return (
    <RiskIndicators
      {...props}
      queryParams={queryString.parse(props.location.search)}
    />
  );
};

const configs = props => {
  return (
    <ConfigList
      {...props}
      queryParams={queryString.parse(props.location.search)}
    />
  );
};

const riskAssessments = props => {
  return (
    <RiskAssessments
      {...props}
      queryParams={queryString.parse(props.location.search)}
    />
  );
};
const operations = props => {
  return (
    <Operations
      {...props}
      queryParams={queryString.parse(props.location.search)}
    />
  );
};

const groups = props => {
  return (
    <Groups {...props} queryParams={queryString.parse(props.location.search)} />
  );
};
const plans = props => {
  return (
    <Plans {...props} queryParams={queryString.parse(props.location.search)} />
  );
};
const planForm = props => {
  return (
    <PlanForm
      {...props}
      _id={props?.match?.params?.id}
      queryParams={queryString.parse(props.location.search)}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route
        path="/settings/risk-indicators"
        exact
        component={riskIndicators}
      />
      <Route
        path="/settings/risk-indicators-configs"
        exact
        component={configs}
      />
      <Route path="/settings/risk-indicators-groups" exact component={groups} />
      <Route path="/risk-assessments" exact component={riskAssessments} />
      <Route path="/settings/operations" exact component={operations} />
      <Route path="/settings/risk-assessment-plans" exact component={plans} />
      <Route
        path="/settings/risk-assessment-plans/edit/:id"
        exact
        component={planForm}
      />
      <Route
        path="/settings/risk-assessment-plans/add"
        exact
        component={planForm}
      />
    </>
  );
};

export default routes;
