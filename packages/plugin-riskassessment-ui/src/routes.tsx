import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

const RiskAssessmentList = asyncComponent(() =>
  import(/* webpackChunkName: "List - Riskassessments" */ './containers/List')
);

const ConfigList = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Riskassessments" */ './configs/containers/List'
  )
);

const Submissions = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Riskassessments" */ './formSubmissions/containers/List'
  )
);

const riskAssessments = ({ history, location }) => {
  return (
    <RiskAssessmentList
      history={history}
      queryParams={queryString.parse(location.search)}
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

const submissions = props => {
  return (
    <Submissions
      {...props}
      queryParams={queryString.parse(props.location.search)}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route path="/settings/risk-assessments" component={riskAssessments} />
      <Route
        path="/settings/risk-assessment-configs"
        exact
        component={configs}
      />
      <Route
        path="/settings/risk-assessment-submissions"
        exact
        component={submissions}
      />
    </>
  );
};

export default routes;
