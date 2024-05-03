import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

const Home = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - Calendar Home" */ "./containers/Home"
    )
);

const Calendar = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Home queryParams={queryParams} history={history} />;
};

const ScheduleBase = asyncComponent(
  () => import(/* webpackChunkName: "Schedule" */ "./containers/scheduler/Base")
);

const Schedule = () => {
  const location = useLocation();

  return <ScheduleBase queryParams={queryString.parse(location.search)} />;
};

const CreateSchedulePage = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings CreateSchedulePage" */ "./containers/scheduler/CreatePage"
    )
);

const CreatePage = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  
  return <CreateSchedulePage accountId={accountId} navigate={navigate} />;
};

const EditSchedulePage = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings CreateSchedulePage" */ "./containers/scheduler/EditPage"
    )
);

const EditPage = () => {
  const { id, accountId } = useParams();
  const navigate = useNavigate();

  return (
    <EditSchedulePage pageId={id} accountId={accountId} navigate={navigate} />
  );
};

const routes = () => (
  <Routes>
    <Route path="/settings/calendars" element={<Calendar />} />

    <Route
      path="/settings/schedule"
      key="/settings/schedule"
      element={<Schedule />}
    />

    <Route
      path="/settings/schedule/create/:accountId"
      key="/settings/schedule/create/:accountId"
      element={<CreatePage />}
    />

    <Route
      path="/settings/schedule/edit/:accountId/:id"
      key="/settings/schedule/edit:id"
      element={<EditPage />}
    />
  </Routes>
);

export default routes;
