import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Meetings" */ "./containers/List")
);

const MyMeetings = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Meetings" */ "./components/myMeetings/MyMeetings"
    )
);

const Meetings = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { meetingId } = queryParams;
  const routePath = location.pathname.split("/").slice(-1)[0];

  return (
    <List
      meetingId={meetingId}
      queryParams={queryParams}
      route={routePath}
    />
  );
};

const MyMeetingsComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const routePath = location.pathname.split("/").slice(-1)[0];

  return (
    <MyMeetings queryParams={queryParams} route={routePath} />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route path="/meetings/myCalendar" element={<Meetings />} />
      <Route path="/meetings/myMeetings" element={<MyMeetingsComponent />} />
    </Routes>
  );
};

export default routes;
