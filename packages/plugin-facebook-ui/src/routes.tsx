import React from "react";
import { Route, Routes } from "react-router-dom";
import queryString from "query-string";

import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { Authorization } from "./containers/Authorization";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const CreateFacebook = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings CreateFacebook" */ "./containers/Form"
    )
);

const MessengerBotForm = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings Messenger Bots" */ "./automations/bots/containers/Form"
    )
);

const CreateFacebookComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = queryString.parse(location.search);

  const callBack = () => {
    navigate("/settings/integrations/");
  };

  return <CreateFacebook callBack={callBack} kind={queryParams.kind} />;
};

const FbMessengerBot = () => {
  const location = useLocation();

  const { id } = useParams();
  const queryParams = queryString.parse(location.search);

  return <MessengerBotForm _id={id} queryParams={queryParams} />;
};

const Auth = () => {
  const location = useLocation();

  return <Authorization queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Routes>
    <Route
      key="/settings/integrations/createFacebook"
      path="/settings/integrations/createFacebook"
      element={<CreateFacebookComponent />}
    />

    <Route
      key="/settings/fb-authorization"
      path="/settings/fb-authorization"
      element={<Auth />}
    />

    <Route
      key="/settings/facebook-messenger-bot"
      path="/settings/facebook-messenger-bot/edit/:id"
      element={<FbMessengerBot />}
    />

    <Route
      key="/settings/facebook-messenger-bot"
      path="/settings/facebook-messenger-bot/create"
      element={<FbMessengerBot />}
    />
  </Routes>
);

export default routes;
