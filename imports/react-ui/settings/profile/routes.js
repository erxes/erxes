import React from 'react';
import { mount } from 'react-mounter';
import settingsRoute from '../routes';
import { MainLayout } from '/imports/react-ui/layout/containers';
import { Profile, ChangePassword, NotificationSettings } from './containers';

const profile = settingsRoute.group({
  prefix: '/profile',
});

profile.route('/', {
  name: 'settings/profile',
  action() {
    mount(MainLayout, { content: <Profile /> });
  },
});

profile.route('/change-password', {
  name: 'settings/change-password',
  action() {
    mount(MainLayout, { content: <ChangePassword /> });
  },
});

profile.route('/notification-settings', {
  name: 'settings/notification-settings',
  action() {
    mount(MainLayout, { content: <NotificationSettings /> });
  },
});
