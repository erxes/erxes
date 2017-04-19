import React from 'react';
import { mount } from 'react-mounter';
import { MainLayout } from '/imports/react-ui/layout/containers';
import settingsRoute from '../routes.jsx';
import { ChannelList, ChannelForm } from './containers';

const channels = settingsRoute.group({
  prefix: '/channels',
});

channels.route('/', {
  action(params, queryParams) {
    mount(MainLayout, { content: <ChannelList queryParams={queryParams} /> });
  },
  name: 'settings/channels/list',
});

channels.route('/add', {
  action() {
    mount(MainLayout, { content: <ChannelForm /> });
  },
  name: 'settings/channels/add',
});

channels.route('/edit/:id', {
  action(params) {
    mount(MainLayout, { content: <ChannelForm id={params.id} /> });
  },
  name: 'settings/channels/edit',
});
