import { ImportOptions, Snapshot } from '../types';

export const options = (): ImportOptions => ({
  mongoUrl: 'mongodb://127.0.0.1:27017/core',
  sourceSubdomain: 'source',
  targetSubdomain: 'target',
  clientPortalId: 'portal',
  topicIds: [],
  authorMap: {},
  dryRun: true,
  batchSize: 2,
  maxDocuments: 10000,
  maxBytes: 10000000,
});

export const snapshot = (): Snapshot => ({
  sourceDb: 'erxes_source',
  targetDb: 'erxes_target',
  cms: {
    _id: 'cms',
    clientPortalId: 'portal',
    language: 'mn',
    languages: ['mn', 'en'],
    publicUrl: 'https://help.example.com',
    postUrlField: 'slug',
    postUrlPrefix: '/articles',
  },
  userIds: new Set(['author']),
  mappings: [],
  target: {
    cms_categories: [],
    cms_posts: [],
    cms_custom_post_types: [],
    cms_translations: [],
  },
  topics: [
    {
      _id: 'topic',
      title: 'Мэдлэгийн сан',
      languageCode: 'mn',
      categoryIds: ['parent', 'child'],
      color: '#000000',
    },
  ],
  categories: [
    { _id: 'parent', title: 'Эхлэх', topicId: 'topic', articleIds: [] },
    {
      _id: 'child',
      title: 'Бүртгэл',
      topicId: 'topic',
      parentCategoryId: 'parent',
      articleIds: ['article'],
    },
  ],
  articles: [
    {
      _id: 'article',
      title: 'Бүртгэл үүсгэх',
      summary: 'Тусламж',
      code: 'guide',
      content: '<p>Монгол агуулга</p>',
      categoryId: 'child',
      topicId: 'topic',
      status: 'publish',
      isPrivate: false,
      createdBy: 'author',
      createdDate: new Date('2024-01-01'),
      modifiedDate: new Date('2024-02-01'),
      publishedAt: new Date('2024-01-02'),
      viewCount: 17,
      reactionChoices: ['like', 'legacy'],
      reactionCounts: { like: 3, legacy: 2 },
      image: {
        name: 'cover.png',
        type: 'image/png',
        url: 'https://files.example.com/cover.png',
        size: 10,
      },
      pdfAttachment: {
        pdf: {
          name: 'guide.pdf',
          type: 'application/pdf',
          url: 'https://files.example.com/guide.pdf',
        },
        pages: [],
      },
    },
  ],
  translations: [
    {
      _id: 'translation',
      objectId: 'article',
      type: 'knowledgeBaseArticle',
      language: 'en',
      title: 'Create an account',
      content: '<p>English</p>',
      excerpt: 'Help',
    },
  ],
});
