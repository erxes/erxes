import { getDefaultBoardAndPipelines } from "@erxes/ui-purchases/src/boards/utils";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Navigate } from "react-router-dom";

const Calendar = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Calendar" */ "@erxes/ui-purchases/src/boards/components/Calendar"
    )
);

const PurchaseColumn = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PurchaseColumn" */ "./containers/CalendarColumn"
    )
);

const PurchaseMainActionBar = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PurchaseMainActionbar" */ "./components/PurchaseMainActionBar"
    )
);

const PurchaseBoard = asyncComponent(
  () =>
    import(/* webpackChunkName: "PurchaseBoard" */ "./components/PurchaseBoard")
);

const Conversation = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Conversion" */ "./components/conversion/Conversion"
    )
);

const Purchases = () => {
  let view = localStorage.getItem("purchaseView") || "board";
  let purchasesLink = `/purchase/${view}`;

  const { defaultBoards, defaultPipelines } = getDefaultBoardAndPipelines();

  const [defaultBoardId, defaultPipelineId] = [
    defaultBoards.purchase,
    defaultPipelines.purchase
  ];

  if (defaultBoardId && defaultPipelineId) {
    purchasesLink = `/purchase/${view}?id=${defaultBoardId}&pipelineId=${defaultPipelineId}`;
  }

  return <Navigate replace to={purchasesLink} />;
};

const Boards = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PurchaseBoard viewType="board" queryParams={queryParams} />;
};

const Activity = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PurchaseBoard viewType="activity" queryParams={queryParams} />;
};

const CalendarComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return (
    <Calendar
      type="purchase"
      title="Purchases"
      queryParams={queryParams}
      ItemColumnComponent={PurchaseColumn}
      MainActionBarComponent={PurchaseMainActionBar}
    />
  );
};

const List = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PurchaseBoard viewType="list" queryParams={queryParams} />;
};

const Chart = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PurchaseBoard viewType="chart" queryParams={queryParams} />;
};

const Gantt = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PurchaseBoard viewType="gantt" queryParams={queryParams} />;
};

const Conversion = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Conversation queryParams={queryParams} />;
};

const Time = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PurchaseBoard viewType="time" queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route key="purchases" path="/purchase" element={<Purchases />} />

      <Route
        key="purchases/board"
        path="/purchase/board"
        element={<Boards />}
      />

      <Route
        key="purchases/calendar"
        path="/purchase/calendar"
        element={<CalendarComponent />}
      />

      <Route
        key="purchases/conversion"
        path="/purchase/conversion"
        element={<Conversion />}
      />

      <Route
        key="purchases/activity"
        path="/purchase/activity"
        element={<Activity />}
      />

      <Route key="purchases/list" path="/purchase/list" element={<List />} />

      <Route key="purchases/chart" path="/purchase/chart" element={<Chart />} />

      <Route key="purchases/gantt" path="/purchase/gantt" element={<Gantt />} />

      <Route key="purchases/time" path="/purchase/time" element={<Time />} />
    </Routes>
  );
};

export default routes;
