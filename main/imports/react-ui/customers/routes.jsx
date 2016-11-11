import React from 'react';
import { mount } from 'react-mounter';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { MainLayout } from '../layout/containers';
import CustomersListContainer from './containers/CustomersListContainer';
import { Details } from './components';


const group = FlowRouter.group({
  prefix: '/customers',
});

group.route('/', {
  name: 'customers/list',
  action(params, queryParams) {
    mount(MainLayout, {
      content: <CustomersListContainer queryParams={queryParams} />,
    });
  },
});

group.route('/details/:id', {
  name: 'customers/details',
  action(params) {
    mount(MainLayout, { content: <Details id={params.id} /> });
  },
});
