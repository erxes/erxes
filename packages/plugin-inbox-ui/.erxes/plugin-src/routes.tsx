import React from 'react';
import InboxRoutes from './inboxs/routes';
import ChannelSettings from './settings/channels/routes';
import IntegrationSettings from './settings/integrations/routes';
import ResponseTemplates from './settings/responseTemplates/routes';
import SkillSettings from './settings/skills/routes';

const routes = () => {
  console.log('hhhhh')
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
