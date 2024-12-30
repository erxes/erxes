import React from "react";
import queryString from "query-string";

import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { Authorization } from "./containers/Authorization";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Route, Routes } from "react-router-dom";

const CreateWhatsapp = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings CreateWhatsapp" */ "./containers/Form"
    )
);
const MessengerBotForm = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings Messenger Bots" */ "./automations/bots/containers/Form"
    )
);

const CreateWhatsappComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = queryString.parse(location.search);

  const callBack = () => {
    navigate("/settings/integrations/");
  };

  return (
    <CreateWhatsapp
      callBack={callBack}
      kind={queryParams.kind}
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
const Auth = () => {
  const location = useLocation();
  return <Authorization queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Routes>
    <Route
      key='/settings/integrations/createWhatsapp'
      path='/settings/integrations/createWhatsapp'
      element={<CreateWhatsappComponent />}
    />

    <Route
      key='/settings/whatsapp-authorization'
      path='/settings/whatsapp-authorization'
      element={<Auth />}
    />
    <Route
      key='/settings/whatsapp-messenger-bot'
      path='/settings/whatsapp-messenger-bot/edit/:id'
      element={<WHATSAPPBot />}
    />
    <Route
      key='/settings/whatsapp-messenger-bot'
      path='/settings/whatsapp-messenger-bot/create'
      element={<WHATSAPPBot />}
    />
  </Routes>
);

export default routes;
