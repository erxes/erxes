import React from 'react';
import { mount } from 'react-mounter';
import settingsRoute from '../routes.jsx';
import { MainLayout } from '/imports/react-ui/layout/containers';
import { List, Signature } from './containers';

const emails = settingsRoute.group({
  prefix: '/emails',
});

emails.route('/', {
  name: 'settings/emails/list',
  action() {
    mount(MainLayout, { content: <List /> });
  },
});

emails.route('/signatures', {
  name: 'settings/emails/signatures',
  action() {
    mount(MainLayout, { content: <Signature /> });
  },
});
