import React from 'react';
import { mount } from 'react-mounter';
import { MainLayout } from '/imports/react-ui/layout/containers';
import settingsRoute from '../routes';
import { KbTopicList } from './containers';
import { AddKnowledgeBase } from './components';

const knowledgebase = settingsRoute.group({
  prefix: '/knowledgebase',
});

knowledgebase.route('/', {
  name: 'settings/knowledgebase/list',

  action(params, queryParams) {
    mount(MainLayout, { content: <KbTopicList queryParams={queryParams} /> });
  },
});

// knowledgebase.route('/add', {
//   name: 'settings/knowledgebase/add',

//   action() {
//     mount(MainLayout, { content: <AddKnowledgeBase /> });
//   },
// });

// knowledgebase.route('/categories/', {
//   name: 'settings/knowledgebase/categories',

//   action(params, queryParams) {
//     mount(MainLayout, { content: <KbCategoryList queryParams={queryParams} /> });
//   },
// });

// knowledgebase.route('/categories/add', {
//   name: 'settings/knowledgebase/categories/add',

//   action() {
//     mount(MainLayout, { content: <AddKnowledgeBase /> });
//   },
// });
