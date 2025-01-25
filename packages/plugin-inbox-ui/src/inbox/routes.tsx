import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const InboxComponent = asyncComponent(
  () => import(/* webpackChunkName: "InboxCore"   */ "./containers/InboxCore")
);
const MessengerBotForm = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings Messenger Bots" */ "../automations/bots/containers/Form"
    )
);

const Index = () => {
  const location = useLocation();

  return (
    <Navigate
      replace
      to={`/inbox/index${location.search}`}
    />
  );
};

const Inbox = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <InboxComponent
      navigate={navigate}
      location={location}
      queryParams={queryString.parse(location.search)}
    />
  );
};
const WHATSAPPBot = () => {
  const location = useLocation();

  const { id } = useParams();
  const queryParams = queryString.parse(location.search);

  return (
    <MessengerBotForm
      _id={id}
      queryParams={queryParams}
    />
  );
};
const routes = () => {
  return (
    <Routes>
      <Route
        path='/inbox/index'
        key='inbox/index'
        element={<Inbox />}
      />
      <Route
        path='/inbox'
        key='inbox'
        element={<Index />}
      />
      <Route
        key='/settings/widgets-messenger-bot'
        path='/settings/widgets-messenger-bot/edit/:id'
        element={<WHATSAPPBot />}
      />
      <Route
        key='/settings/widgets-messenger-bot'
        path='/settings/widgets-messenger-bot/create'
        element={<WHATSAPPBot />}
      />
    </Routes>
  );
};

export default routes;
