import ChannelSettings from "./settings/channels/routes";
import FormsSettings from "./forms/routes";
import InboxRoutes from "./inbox/routes";
import IntegrationConfigs from "./settings/integrationsConfig/routes";
import IntegrationSettings from "./settings/integrations/routes";
import React from "react";
import ResponseTemplates from "./settings/responseTemplates/routes";
import ScriptRoutes from "./scripts/routes";
import SkillSettings from "./settings/skills/routes";
import VideoCallRoutes from "./videoCall/routes";
import { Route, Routes } from "react-router-dom";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import queryString from "query-string";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

const MessengerBotForm = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings Messenger Bots" */ "./automations/bots/containers/Form"
    )
);

const routes = () => {
  return (
    <>
      <InboxRoutes />
      <ChannelSettings />
      <IntegrationSettings />
      <IntegrationConfigs />
      <ResponseTemplates />
      <SkillSettings />
      <FormsSettings />
      <VideoCallRoutes />
      <ScriptRoutes />
    </>
  );
};

export default routes;
