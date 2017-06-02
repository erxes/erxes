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
  action() {
    mount(MainLayout, { content: <MessageList /> });
  },
});

group.route('/messages/list', {
  name: 'engage/messages/list',
  action(params, queryParams) {
    mount(MainLayout, { content: <MessageList type={queryParams.type} /> });
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
