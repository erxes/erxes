import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const CMS_POST_ACTIONS = {
  read: 'cmsPostsRead',
  createPublished: 'cmsPostsCreatePublished',
  createReview: 'cmsPostsCreateReview',
  update: 'cmsPostsUpdate',
  approve: 'cmsPostsApprove',
  remove: 'cmsPostsRemove',
  managePermissions: 'cmsPermissionsManage',
  languageAll: 'cmsLanguageAll',
  languageMn: 'cmsLanguageMn',
  languageEn: 'cmsLanguageEn',
} as const;

const journalist1Actions = [
  CMS_POST_ACTIONS.read,
  CMS_POST_ACTIONS.createPublished,
  CMS_POST_ACTIONS.languageAll,
];

const journalist2Actions = [
  CMS_POST_ACTIONS.read,
  CMS_POST_ACTIONS.createReview,
  CMS_POST_ACTIONS.languageAll,
];

const editorActions = [
  CMS_POST_ACTIONS.read,
  CMS_POST_ACTIONS.update,
  CMS_POST_ACTIONS.approve,
  CMS_POST_ACTIONS.languageAll,
];

const adminActions = [
  ...editorActions,
  CMS_POST_ACTIONS.createPublished,
  CMS_POST_ACTIONS.remove,
  CMS_POST_ACTIONS.managePermissions,
];

export const permissions: IPermissionConfig = {
  plugin: 'content',

  modules: [
    {
      name: 'cmsPost',
      description: 'CMS news and post management',
      ownerFields: ['authorId'],
      scopes: [
        {
          name: 'own',
          description: 'Posts authored by the user',
        },
        {
          name: 'all',
          description: 'All CMS posts',
        },
      ],
      actions: [
        {
          title: 'View CMS posts',
          name: CMS_POST_ACTIONS.read,
          description: 'View CMS posts and translations',
          always: true,
        },
        {
          title: 'Create and publish CMS posts',
          name: CMS_POST_ACTIONS.createPublished,
          description: 'Create CMS posts that are published immediately',
        },
        {
          title: 'Create CMS posts for review',
          name: CMS_POST_ACTIONS.createReview,
          description: 'Create CMS posts that require editor approval',
        },
        {
          title: 'Edit CMS posts',
          name: CMS_POST_ACTIONS.update,
          description: 'Edit CMS posts created by journalists',
        },
        {
          title: 'Approve CMS posts',
          name: CMS_POST_ACTIONS.approve,
          description: 'Publish CMS posts submitted for approval',
        },
        {
          title: 'Delete CMS posts',
          name: CMS_POST_ACTIONS.remove,
          description: 'Delete CMS posts',
        },
        {
          title: 'Manage CMS roles',
          name: CMS_POST_ACTIONS.managePermissions,
          description: 'Manage CMS journalist and editor permissions',
        },
        {
          title: 'All CMS languages',
          name: CMS_POST_ACTIONS.languageAll,
          description: 'Create, edit and approve CMS content in any language',
          type: 'custom',
        },
        {
          title: 'Mongolian CMS language',
          name: CMS_POST_ACTIONS.languageMn,
          description: 'Create, edit and approve Mongolian CMS content',
          type: 'custom',
        },
        {
          title: 'English CMS language',
          name: CMS_POST_ACTIONS.languageEn,
          description: 'Create, edit and approve English CMS content',
          type: 'custom',
        },
      ],
    },
  ],

  defaultGroups: [
    {
      id: 'content:cms-journalist-1',
      name: 'CMS Journalist 1',
      description: 'Can write CMS news and publish immediately',
      permissions: [
        {
          plugin: 'content',
          module: 'cmsPost',
          actions: journalist1Actions,
          scope: 'all',
        },
      ],
    },
    {
      id: 'content:cms-journalist-2',
      name: 'CMS Journalist 2',
      description: 'Can write CMS news that requires editor approval',
      permissions: [
        {
          plugin: 'content',
          module: 'cmsPost',
          actions: journalist2Actions,
          scope: 'all',
        },
      ],
    },
    {
      id: 'content:cms-editor',
      name: 'CMS Editor',
      description: 'Can edit and approve CMS news from journalists',
      permissions: [
        {
          plugin: 'content',
          module: 'cmsPost',
          actions: editorActions,
          scope: 'all',
        },
      ],
    },
    {
      id: 'content:cms-admin',
      name: 'CMS Admin',
      description: 'Full access to CMS posts, roles and approvals',
      permissions: [
        {
          plugin: 'content',
          module: 'cmsPost',
          actions: adminActions,
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'permissions',
          actions: ['permissionsRead', 'permissionsManage'],
          scope: 'all',
        },
      ],
    },
    {
      id: 'content:viewer',
      name: 'CMS Viewer',
      description: 'Read-only access to CMS posts',
      permissions: [
        {
          plugin: 'content',
          module: 'cmsPost',
          actions: [CMS_POST_ACTIONS.read, CMS_POST_ACTIONS.languageAll],
          scope: 'all',
        },
      ],
    },
  ],
};
