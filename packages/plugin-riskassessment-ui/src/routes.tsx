import { Route, Routes, useLocation, useParams } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const RiskIndicators = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Riskindicators" */ './indicator/containers/List'
    )
);

const RiskIndicator = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Detail - Riskindicator" */ './indicator/containers/Form'
    )
);

const ConfigList = asyncComponent(
  () =>
    import(/* webpackChunkName: "List - Configs" */ './configs/containers/List')
);

const RiskAssessments = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Riskassessments" */ './assessments/containers/List'
    )
);

const Operations = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Operations" */ './operations/containers/List'
    )
);
const Groups = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Groups" */ './indicator/groups/containers/List'
    )
);

const GroupForm = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Form - Groups" */ './indicator/groups/containers/Form'
    )
);
const Plans = asyncComponent(
  () => import(/* webpackChunkName: "List - Plans" */ './plan/containers/List')
);

const PlanForm = asyncComponent(
  () => import(/* webpackChunkName: "List - Forms" */ './plan/containers/Form')
);

const RiskIndicatorsComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  return <RiskIndicators queryParams={queryParams} />;
};

const RiskIndicatorComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { id } = useParams();
  return <RiskIndicator _id={id} queryParams={queryParams} />;
};

const ConfigsComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  return <ConfigList queryParams={queryParams} />;
};

const RiskAssessmentsComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <RiskAssessments queryParams={queryParams} />;
};
const OperationsComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  return <Operations queryParams={queryParams} />;
};

const GroupsListComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  return <Groups queryParams={queryParams} />;
};

const GroupsFormComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { id } = useParams();
  return <GroupForm _id={id} queryParams={queryParams} />;
};

const PlansComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  return <Plans queryParams={queryParams} />;
};
const PlanFormComponent = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PlanForm _id={id} queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/settings/risk-indicators"
        element={<RiskIndicatorsComponent />}
      />

      <Route
        path="/settings/risk-indicators/add"
        element={<RiskIndicatorComponent />}
      />

      <Route
        path="/settings/risk-indicators/detail/:id"
        element={<RiskIndicatorComponent />}
      />

      <Route
        path="/settings/risk-indicators-configs"
        element={<ConfigsComponent />}
      />
      <Route
        path="/settings/risk-indicators-groups"
        element={<GroupsListComponent />}
      />
      <Route
        path="/settings/risk-indicators-groups/add"
        element={<GroupsFormComponent />}
      />
      <Route
        path="/settings/risk-indicators-groups/edit/:id"
        element={<GroupsFormComponent />}
      />
      <Route path="/risk-assessments" element={<RiskAssessmentsComponent />} />
      <Route path="/settings/operations" element={<OperationsComponent />} />
      <Route
        path="/settings/risk-assessment-plans"
        element={<PlansComponent />}
      />
      <Route
        path="/settings/risk-assessment-plans/edit/:id"
        element={<PlanFormComponent />}
      />
      <Route
        path="/settings/risk-assessment-plans/add"
        element={<PlanFormComponent />}
      />
    </Routes>
  );
};

export default routes;
