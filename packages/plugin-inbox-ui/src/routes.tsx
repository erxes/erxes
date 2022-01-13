import React from 'react';
import InboxRoutes from './inbox/routes';
import ChannelSettings from './settings/channels/routes';
import IntegrationSettings from './settings/integrations/routes';
import ResponseTemplates from './settings/responseTemplates/routes';
import SkillSettings from './settings/skills/routes';

const routes = () => {

  return (
    <React.Fragment>
      <InboxRoutes />
      <ChannelSettings />
      <IntegrationSettings />
      <ResponseTemplates />
      <SkillSettings />
    </React.Fragment>
  );
};

export default routes;
