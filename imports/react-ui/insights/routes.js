import React from 'react';
import { mount } from 'react-mounter';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { MainLayout } from '../layout/containers';
import { TeamMembers, PunchCard } from './containers';

const group = FlowRouter.group({
  prefix: '/insight',
});

group.route('/', {
  name: 'insight/team-members',
  action(params, queryParams) {
    mount(MainLayout, { content: <TeamMembers queryParams={queryParams} /> });
  },
});

group.route('/punch-card', {
  name: 'insight/punch-card',
  action(params, queryParams) {
    mount(MainLayout, { content: <PunchCard queryParams={queryParams} /> });
  },
});
