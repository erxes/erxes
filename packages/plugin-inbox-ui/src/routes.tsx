import React from "react";
import InboxRoutes from "./inbox/routes";
import ChannelSettings from "./settings/channels/routes";
import IntegrationSettings from "./settings/integrations/routes";
import ResponseTemplates from "./settings/responseTemplates/routes";
import SkillSettings from "./settings/skills/routes";
import BookingSettings from "./bookings/routes";
import FormsSettings from "./forms/routes";
import IntegrationConfigs from "./settings/integrationsConfig/routes";
import VideoCallRoutes from "./videoCall/routes";
import ScriptRoutes from './scripts/routes';

const routes = () => {
  return (
    <>
      <InboxRoutes />
      <ChannelSettings />
      <IntegrationSettings />
      <IntegrationConfigs />
      <ResponseTemplates />
      <SkillSettings />
      <BookingSettings />
      <FormsSettings />
      <VideoCallRoutes />
      <ScriptRoutes/>
    </>
  );
};

export default routes;
