module.exports = {
  payments: {
    name: 'cms',
    description: 'CMS',
    actions: [
      {
        name: 'cmsAll',
        description: 'All',
        use: [
          'cmsPostsAdd',
          'cmsPostsEdit',
          'cmsPostsRemove',
          'cmsTagsAdd',
          'cmsTagsEdit',
          'cmsTagsRemove',
          'cmsCategoriesAdd',
          'cmsCategoriesEdit',
          'cmsCategoriesRemove',
          'cmsPagesAdd',
          'cmsPagesEdit',
          'cmsPagesRemove',
          'cmsMenuAdd',
          'cmsMenuEdit',
          'cmsMenuRemove',
          'showCmsPosts',
          'showCmsTags',
          'showCmsCategories'
        ],
      },
      {
        name: 'cmsPostsAdd',
        description: 'Add post',
      },
      {
        name: 'cmsPostsEdit',
        description: 'Edit post',
      },
      {
        name: 'cmsPostsRemove',
        description: 'Remove post',
      },
      {
        name: 'cmsTagsAdd',
        description: 'Add tag',
      },
      {
        name: 'cmsTagsEdit',
        description: 'Edit tag',
      },
      {
        name: 'cmsTagsRemove',
        description: 'Remove tag',
      },
      {
        name: 'cmsCategoriesAdd',
        description: 'Add category',
      },
      {
        name: 'cmsCategoriesEdit',
        description: 'Edit category',
      },
      {
        name: 'cmsCategoriesRemove',
        description: 'Remove category',
      },
      {
        name: 'cmsPagesAdd',
        description: 'Add page',
      },
      {
        name: 'cmsPagesEdit',
        description: 'Edit page',
      },
      {
        name: 'cmsPagesRemove',
        description: 'Remove page',
      },
      {
        name: 'cmsMenuAdd',
        description: 'Add menu',
      },
      {
        name: 'cmsMenuEdit',
        description: 'Edit menu',
      },
      {
        name: 'cmsMenuRemove',
        description: 'Remove menu',
      },

      {
        name: 'showCmsPosts',
        description: 'Show posts',
      },
      {
        name: 'showCmsTags',
        description: 'Show cms tags'
      },
      {
        name: 'showCmsCategories',
        descriotion: 'Show cms categories'
      }

    ],
  },
};
