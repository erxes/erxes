import React from 'react';
import { mount } from 'react-mounter';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { MainLayout } from '../layout/containers';
import { Insights, TeamMembers, PunchCard } from './containers';

const group = FlowRouter.group({
  prefix: '/insights',
});

group.route('/', {
  name: 'insights',
  action(params, queryParams) {
    mount(MainLayout, { content: <Insights queryParams={queryParams} /> });
  },
});

group.route('/team-members', {
  name: 'insights/team-members',
  action(params, queryParams) {
    mount(MainLayout, { content: <TeamMembers queryParams={queryParams} /> });
  },
});

group.route('/punch-card', {
  name: 'insights/punch-card',
  action(params, queryParams) {
    mount(MainLayout, { content: <PunchCard queryParams={queryParams} /> });
  },
});
