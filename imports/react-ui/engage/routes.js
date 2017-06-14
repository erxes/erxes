import React from 'react';
import { mount } from 'react-mounter';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { MainLayout } from '../layout/containers';
import { MessageList, MessageForm } from './containers';

const group = FlowRouter.group({
  prefix: '/engage',
});

group.route('/', {
  name: 'engage/home',
  action(params, queryParams) {
    mount(MainLayout, { content: <MessageList queryParams={queryParams} /> });
  },
});

group.route('/messages/create', {
  name: 'engage/messages/create',
  action(params, queryParams) {
    mount(MainLayout, { content: <MessageForm type={queryParams.type} /> });
  },
});

group.route('/messages/edit/:_id', {
  name: 'engage/messages/edit',
  action(params) {
    mount(MainLayout, { content: <MessageForm messageId={params._id} /> });
  },
});
