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

const riskIndicators = ({ history, location }) => {
  return (
    <RiskIndicators
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

const routes = () => {
  return (
    <>
      <Route path="/settings/risk-indicators" component={riskIndicators} />
      <Route
        path="/settings/risk-indicators-configs"
        exact
        component={configs}
      />
      <Route path="/settings/risk-indicators-groups" exact component={groups} />
      <Route
        path="/settings/risk-assessments"
        exact
        component={riskAssessments}
      />
      <Route path="/settings/operations" exact component={operations} />
    </>
  );
};

export default routes;
