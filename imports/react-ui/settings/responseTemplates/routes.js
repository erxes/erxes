import React from 'react';
import { mount } from 'react-mounter';
import { MainLayout } from '/imports/react-ui/layout/containers';
import settingsRoute from '../routes';
import { List, Form } from './containers';

const responseTemplates = settingsRoute.group({
  prefix: '/response-templates',
});

responseTemplates.route('/', {
  action(params, queryParams) {
    mount(MainLayout, { content: <List queryParams={queryParams} /> });
  },
  name: 'settings/responseTemplates/list',
});

responseTemplates.route('/add', {
  action() {
    mount(MainLayout, { content: <Form /> });
  },
  name: 'settings/responseTemplates/add',
});

responseTemplates.route('/edit/:id', {
  action(params) {
    mount(MainLayout, { content: <Form id={params.id} /> });
  },
  name: 'settings/responseTemplates/edit',
});
