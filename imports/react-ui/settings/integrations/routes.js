import React from 'react';
import { mount } from 'react-mounter';
import { MainLayout } from '/imports/react-ui/layout/containers';
import settingsRoute from '../routes';

import { List, Messenger, Twitter, MessengerAppearance, MessengerConfigs } from './containers';

import { AddIntegration } from './components';

const integrations = settingsRoute.group({
  prefix: '/integrations',
});

integrations.route('/messenger', {
  name: 'settings/integrations/messenger',

  action() {
    mount(MainLayout, { content: <Messenger /> });
  },
});

integrations.route('/messenger/appearance/:integrationId', {
  name: 'settings/integrations/messenger/appearance',

  action({ integrationId }) {
    mount(MainLayout, {
      content: <MessengerAppearance integrationId={integrationId} />,
    });
  },
});

integrations.route('/messenger/configs/:integrationId', {
  name: 'settings/integrations/messenger/configs',

  action({ integrationId }) {
    mount(MainLayout, {
      content: <MessengerConfigs integrationId={integrationId} />,
    });
  },
});

// twitter ===========
integrations.route('/twitter', {
  name: 'settings/integrations/twitter',

  action() {
    mount(MainLayout, { content: <Twitter type="link" /> });
  },
});

integrations.route('/add', {
  name: 'settings/integrations/add',

  action() {
    mount(MainLayout, { content: <AddIntegration /> });
  },
});

integrations.route('/oauth/twitter_callback', {
  name: 'settings/integrations/twitter/oauth/callback',

  action() {
    mount(MainLayout, { content: <Twitter type="form" /> });
  },
});

integrations.route('/:integrationId?', {
  name: 'settings/integrations/list',

  action(params, queryParams) {
    mount(MainLayout, { content: <List queryParams={queryParams} /> });
  },
});
