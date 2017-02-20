import React from 'react';
import { mount } from 'react-mounter';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { MainLayout } from '../layout/containers';
import { SegmentsList, SegmentsForm } from './containers';


const group = FlowRouter.group({
  prefix: '/segments',
});

group.route('/', {
  name: 'segments/list',
  action() {
    mount(MainLayout, {
      content: <SegmentsList />,
    });
  },
});

group.route('/new', {
  name: 'segments/new',
  action() {
    mount(MainLayout, {
      content: <SegmentsForm />,
    });
  },
});

group.route('/edit/:id', {
  name: 'segments/edit',
  action(params) {
    mount(MainLayout, {
      content: <SegmentsForm id={params.id} />,
    });
  },
});
