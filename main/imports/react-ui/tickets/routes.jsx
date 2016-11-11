import React from 'react';
import { mount } from 'react-mounter';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { MainLayout } from '../layout/containers';
import List from './containers/TicketList';
import Detail from './containers/TicketDetail';


const group = FlowRouter.group({
  prefix: '/tickets',
});

group.route('/:channelId', {
  action(params, queryParams) {
    mount(MainLayout, {
      content: <List channelId={params.channelId} queryParams={queryParams} />,
      title: 'Tickets',
      description: 'Tickets list',
    });
  },
  name: 'tickets/list',
});

group.route('/detail/:id', {
  action(params) {
    mount(MainLayout, {
      content: <Detail id={params.id} />,
      title: 'Ticket',
      description: params.id,
    });
  },
  name: 'tickets/detail',
});
