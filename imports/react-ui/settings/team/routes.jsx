import React from 'react';
import { mount } from 'react-mounter';

import { MainLayout } from '/imports/react-ui/layout/containers';

import settingsRoute from '../routes.jsx';
import { UsersList } from './containers';

const team = settingsRoute.group({
  prefix: '/team',
});

team.route('/', {
  action(params, queryParams) {
    mount(MainLayout, { content: <UsersList queryParams={queryParams} /> });
  },
  name: 'settings/team/list',
});
