import React from 'react';
import { mount } from 'react-mounter';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { MainLayout } from '../layout/containers';
import { List } from './containers';

const group = FlowRouter.group({
  prefix: '/tags',
});

group.route('/:type', {
  name: 'tags/list',
  action(params) {
    mount(MainLayout, { content: <List type={params.type} /> });
  },
});
