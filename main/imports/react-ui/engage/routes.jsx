import React from 'react';
import { mount } from 'react-mounter';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { MainLayout } from '../layout/containers';
import Engage from './components';


const group = FlowRouter.group({
  prefix: '/engage',
});

group.route('/', {
  action() {
    mount(MainLayout, {
      content: <Engage />,
      title: 'Engage',
      description: 'Engages list',
    });
  },
});
