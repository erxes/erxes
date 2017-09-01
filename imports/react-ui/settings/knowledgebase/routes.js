import React from 'react';
import { mount } from 'react-mounter';
import { MainLayout } from '/imports/react-ui/layout/containers';
import settingsRoute from '../routes';
import { KbTopicList, KbCategoryList, KbArticleList } from './containers';

const knowledgebase = settingsRoute.group({
  prefix: '/knowledgebase',
});

knowledgebase.route('/', {
  name: 'settings/knowledgebase/list',

  action(params, queryParams) {
    mount(MainLayout, { content: <KbTopicList queryParams={queryParams} /> });
  },
});

knowledgebase.route('/categories/', {
  name: 'settings/knowledgebase/categories',

  action(params, queryParams) {
    mount(MainLayout, { content: <KbCategoryList queryParams={queryParams} /> });
  },
});

knowledgebase.route('/articles/', {
  name: 'settings/knowledgebase/articles',

  action(params, queryParams) {
    mount(MainLayout, { content: <KbArticleList queryParams={queryParams} /> });
  },
});
