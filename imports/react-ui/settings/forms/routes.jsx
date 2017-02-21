import React from 'react';
import { mount } from 'react-mounter';
import { MainLayout } from '/imports/react-ui/layout/containers';
import settingsRoute from '../routes.jsx';
import { List } from './containers';


const forms = settingsRoute.group({
  prefix: '/forms',
});

forms.route('/', {
  name: 'settings/forms/list',
  action(params, queryParams) {
    mount(MainLayout, { content: <List queryParams={queryParams} /> });
  },
});
