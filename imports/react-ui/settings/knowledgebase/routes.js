import React from 'react';
import { mount } from 'react-mounter';
import { MainLayout } from '/imports/react-ui/layout/containers';
import settingsRoute from '../routes';

import { List } from './containers';

import { AddKnowledgeBase } from './components';

const knowledgebase = settingsRoute.group({
  prefix: '/knowledgebase',
});

knowledgebase.route('/list', {
  name: 'settings/knowledgebase/list',

  action(params, queryParams) {
    mount(MainLayout, { content: <List queryParams={queryParams} /> });
  },
});

knowledgebase.route('/add', {
  name: 'settings/integrations/add',

  action() {
    mount(MainLayout, { content: <AddKnowledgeBase /> });
  },
});

// integrations.route('/add', {
//   name: 'settings/knowledgebase/add',

//   action() {
//     mount(MainLayout, { content: <AddKbGroup /> });
//   },
// });

// integrations.route('/messenger', {
//   name: 'settings/integrations/messenger',

//   action() {
//     mount(MainLayout, { content: <Messenger /> });
//   },
// });

// integrations.route('/messenger/appearance/:integrationId', {
//   name: 'settings/integrations/messenger/appearance',

//   action({ integrationId }) {
//     mount(MainLayout, {
//       content: <MessengerAppearance integrationId={integrationId} />,
//     });
//   },
// });

// integrations.route('/messenger/availability/:integrationId', {
//   name: 'settings/integrations/messenger/availability',

//   action({ integrationId }) {
//     mount(MainLayout, {
//       content: <MessengerAvailability integrationId={integrationId} />,
//     });
//   },
// });

// // twitter ===========
// integrations.route('/twitter', {
//   name: 'settings/integrations/twitter',

//   action() {
//     mount(MainLayout, { content: <Twitter type="link" /> });
//   },
// });

// integrations.route('/add', {
//   name: 'settings/integrations/add',

//   action() {
//     mount(MainLayout, { content: <AddIntegration /> });
//   },
// });

// integrations.route('/oauth/twitter_callback', {
//   name: 'settings/integrations/twitter/oauth/callback',

//   action() {
//     mount(MainLayout, { content: <Twitter type="form" /> });
//   },
// });
