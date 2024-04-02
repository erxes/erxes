import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";

const LabelConfigs = asyncComponent(
  () =>
    import(
      /* webpackChunkName: 'Sales Plans' */ "./settings/containers/label/LabelsList"
    )
);

const LabelsList = () => {
  const location = useLocation();
  return <LabelConfigs queryParams={queryString.parse(location.search)} />;
};

const TimeConfigs = asyncComponent(
  () =>
    import(
      /* webpackChunkName: 'Sales Plans' */ "./settings/containers/time/TimesList"
    )
);

const TimesList = () => {
  const location = useLocation();
  return <TimeConfigs queryParams={queryString.parse(location.search)} />;
};

const YearPlans = asyncComponent(
  () =>
    import(
      /* webpackChunkName: 'Sales Plans' */ "./plans/containers/YearPlanList"
    )
);

const DayPlans = asyncComponent(
  () =>
    import(
      /* webpackChunkName: 'Sales Plans' */ "./plans/containers/DayPlanList"
    )
);

const DayLabels = asyncComponent(
  () =>
    import(
      /* webpackChunkName: 'Sales Plans' */ "./dayLabels/containers/DayLabelList"
    )
);

const YearPlanList = () => {
  const location = useLocation();
  return <YearPlans queryParams={queryString.parse(location.search)} />;
};

const DayPlanList = () => {
  const location = useLocation();
  return <DayPlans queryParams={queryString.parse(location.search)} />;
};

const DayLabelsList = () => {
  const location = useLocation();
  return <DayLabels queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/salesplans/labels"
        key="/salesplans/labels"
        element={<LabelsList />}
      />
      <Route
        path="/salesplans/timeframes"
        key="/salesplans/timeframes"
        element={<TimesList />}
      />
      <Route
        path="/sales-plans/year-plan"
        key="/sales-plans/year-plan"
        element={<YearPlanList />}
      />
      <Route
        path="/sales-plans/day-plan"
        key="/sales-plans/day-plan"
        element={<DayPlanList />}
      />
      <Route
        path="/sales-plans/day-labels"
        key="/sales-plans/day-labels"
        element={<DayLabelsList />}
      />
    </Routes>
  );
};

export default routes;
