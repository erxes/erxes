import React from 'react';
import { mount } from 'react-mounter';
import { MainLayout } from '/imports/react-ui/layout/containers';
import settingsRoute from '../routes';
import { List, Form } from './containers';

const emailTemplates = settingsRoute.group({
  prefix: '/email-templates',
});

emailTemplates.route('/', {
  action(params, queryParams) {
    mount(MainLayout, { content: <List queryParams={queryParams} /> });
  },
  name: 'settings/emailTemplates/list',
});

emailTemplates.route('/add', {
  action() {
    mount(MainLayout, { content: <Form /> });
  },
  name: 'settings/emailTemplates/add',
});

emailTemplates.route('/edit/:id', {
  action(params) {
    mount(MainLayout, { content: <Form id={params.id} /> });
  },
  name: 'settings/emailTemplates/edit',
});
