import React from 'react';
import { mount } from 'react-mounter';
import { MainLayout } from '/imports/react-ui/layout/containers';
import settingsRoute from '../routes.jsx';
import { BrandList } from './containers';


const brands = settingsRoute.group({
  prefix: '/brands',
});

brands.route('/', {
  name: 'settings/brands/list',
  action(params, queryParams) {
    mount(MainLayout, { content: <BrandList queryParams={queryParams} /> });
  },
});
