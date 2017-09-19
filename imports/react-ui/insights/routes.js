import React from 'react';
import { mount } from 'react-mounter';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { MainLayout } from '../layout/containers';
import { VolumeReport, ResponseReport, FirstResponse } from './containers';

const group = FlowRouter.group({
  prefix: '/insights',
});

group.route('/', {
  name: 'insights',
  action(params, queryParams) {
    mount(MainLayout, { content: <VolumeReport queryParams={queryParams} /> });
  },
});

group.route('/response-report', {
  name: 'insights/response-report',
  action(params, queryParams) {
    mount(MainLayout, { content: <ResponseReport queryParams={queryParams} /> });
  },
});

group.route('/first-response', {
  name: 'insights/first-response',
  action(params, queryParams) {
    mount(MainLayout, { content: <FirstResponse queryParams={queryParams} /> });
  },
});
