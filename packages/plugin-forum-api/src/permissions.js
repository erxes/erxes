module.exports = {
  categories: {
    name: 'forumCategories',
    description: 'Forum categories',
    actions: [
      {
        name: 'forumCategoriesAll',
        description: 'All forum category actions',
        use: [
          'forumCreateCategory',
          'forumPatchCategory',
          'forumDeleteCategory',
          'forumForceDeleteCategory',
        ]
      },
      {
        name: 'forumCreateCategory',
        description: 'Create forum categories'
      },
      {
        name: 'forumPatchCategory',
        description: 'Edit forum categories'
      },
      {
        name: 'forumDeleteCategory',
        description: 'Delete forum categories'
      },
      {
        name: 'forumForceDeleteCategory',
        description: 'Force delete forum categories'
      }
    ]
  },
  posts: {
    name: 'forumPosts',
    description: 'Forum posts',
    actions: [
      {
        name: 'forumPostsAll',
        description: 'All forum post actions',
        use: [
          'forumCreatePost',
          'forumPatchPost',
          'forumDeletePost',
          'forumPostDraft',
          'forumPostPublish',
        ]
      },
      {
        name: 'forumCreatePost',
        description: 'Create forum posts'
      },
      {
        name: 'forumPatchPost',
        description: 'Edit forum posts'
      },
      {
        name: 'forumDeletePost',
        description: 'Delete forum posts'
      },
      {
        name: 'forumPostDraft',
        description: 'Turn forum posts into drafts'
      },
      {
        name: 'forumPostPublish',
        description: 'Publish forum posts'
      }
    ]
  },
  comments: {
    name: 'forumComments',
    description: 'Forum comments',
    actions: [
      {
        name: 'postsAll',
        description: 'All forum comment actions',
        use: [
          'forumCreatePost',
          'forumPatchPost',
          'forumDeletePost',
          'forumPostDraft',
          'forumPostPublish',
        ]
      },
      {
        name: 'forumCreateComment',
        description: 'Create forum comments'
      },
      {
        name: 'forumUpdateComment',
        description: 'Edit forum comments'
      },
      {
        name: 'forumDeleteComment',
        description: 'Delete forum comments'
      }
    ]
  }
}