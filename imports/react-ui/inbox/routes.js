import React from 'react';
import { mount } from 'react-mounter';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { MainLayout } from '../layout/containers';
import { List, Details } from './containers';

const group = FlowRouter.group({
  prefix: '/inbox',
});

group.route('/:channelId?', {
  name: 'inbox/list',
  action(params, queryParams) {
    mount(MainLayout, {
      content: <List channelId={params.channelId} queryParams={queryParams} />,
    });
  },
});

group.route('/details/:id', {
  name: 'inbox/details',
  action(params, queryParams) {
    mount(MainLayout, {
      content: (
        <Details id={params.id} channelId={queryParams.channelId} queryParams={queryParams} />
      ),
    });
  },
});
