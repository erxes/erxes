import React from 'react';
import { mount } from 'react-mounter';
import { MainLayout } from '/imports/react-ui/layout/containers';
import settingsRoute from '../routes.jsx';
import { IntegrationList } from './containers';


const integrations = settingsRoute.group({
  prefix: '/integrations',
});

integrations.route('/:integrationId?', {
  name: 'settings/integrations/list',
  action() {
    mount(MainLayout, { content: <IntegrationList /> });
  },
});
