import React from 'react';
import InboxRoutes from './inbox/routes';
import ChannelSettings from './settings/channels/routes';
import IntegrationSettings from './settings/integrations/routes';
import ResponseTemplates from './settings/responseTemplates/routes';
import SkillSettings from './settings/skills/routes';

const routes = () => {
  return (
    <>
      <InboxRoutes />
      <ChannelSettings />
      <IntegrationSettings />
      <ResponseTemplates />
      <SkillSettings />
    </>
  );
};

export default routes;
