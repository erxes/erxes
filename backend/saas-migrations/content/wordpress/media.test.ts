import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyMediaToImportPlan,
  createPinnedDnsLookup,
  formatMediaImportError,
} from './media';
import type { WordPressImportPlan } from './types';

const WORDPRESS_IMAGE_URL =
  'https://wordpress.example/wp-content/uploads/example.png';

const createMediaPlan = (): WordPressImportPlan => ({
  sourceSite: 'https://wordpress.example',
  clientPortalId: 'portal',
  cmsUpdate: {},
  categories: [],
  tags: [],
  customPostTypes: [],
  customFieldGroups: [],
  posts: [
    {
      _id: 'post',
      clientPortalId: 'portal',
      count: 1,
      title: 'Example post',
      slug: 'example-post',
      content: `<img src="${WORDPRESS_IMAGE_URL}">`,
      excerpt: '',
      categoryIds: [],
      type: 'post',
      status: 'published',
      tagIds: [],
      authorKind: 'user',
      authorId: 'admin',
      featured: false,
      customFieldsData: [],
    },
  ],
  pages: [],
  translations: [],
  menus: [],
  media: [
    {
      sourceId: 'attachment',
      sourceUrl: WORDPRESS_IMAGE_URL,
      fileName: 'example.png',
      parentTarget: {
        collection: 'cms_posts',
        targetId: 'post',
      },
      featuredTargets: [
        {
          collection: 'cms_posts',
          targetId: 'post',
        },
      ],
    },
  ],
  mappings: [
    {
      _id: 'mapping',
      source: 'wordpress',
      sourceSite: 'https://wordpress.example',
      clientPortalId: 'portal',
      sourceType: 'attachment',
      sourceId: 'attachment',
      targetCollection: 'cms_attachments',
      targetId: 'attachment',
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ],
  warnings: [],
  skipped: {},
});

test('pinned DNS lookup returns one address when all is disabled', async () => {
  const lookup = createPinnedDnsLookup('203.0.113.10', 4);

  await new Promise<void>((resolve, reject) => {
    lookup('example.com', { all: false }, (error, address, family) => {
      if (error) {
        reject(error);
        return;
      }

      assert.equal(address, '203.0.113.10');
      assert.equal(family, 4);
      resolve();
    });
  });
});

test('pinned DNS lookup returns an address array when all is enabled', async () => {
  const lookup = createPinnedDnsLookup('2001:db8::10', 6);

  await new Promise<void>((resolve, reject) => {
    lookup('example.com', { all: true }, (error, addresses) => {
      if (error) {
        reject(error);
        return;
      }

      assert.deepEqual(addresses, [
        {
          address: '2001:db8::10',
          family: 6,
        },
      ]);
      resolve();
    });
  });
});

test('media errors include the nested fetch cause', () => {
  const cause = new Error('Invalid IP address: undefined');
  const error = new Error('fetch failed');

  Object.defineProperty(error, 'cause', { value: cause });

  assert.equal(
    formatMediaImportError(error),
    'fetch failed: Invalid IP address: undefined',
  );
});

test('missing uploads retain WordPress image metadata without completing the mapping', () => {
  const plan = createMediaPlan();

  applyMediaToImportPlan(plan, {
    attachments: new Map(),
    failures: [
      {
        sourceId: 'attachment',
        sourceUrl: WORDPRESS_IMAGE_URL,
        message: 'upload failed',
      },
    ],
  });

  const expectedAttachment = {
    name: 'example.png',
    url: WORDPRESS_IMAGE_URL,
    size: 0,
    type: 'image/png',
  };

  assert.deepEqual(plan.posts[0].images, [expectedAttachment]);
  assert.deepEqual(plan.posts[0].thumbnail, expectedAttachment);
  assert.equal(plan.posts[0].content.includes(WORDPRESS_IMAGE_URL), true);
  assert.equal(plan.mappings[0].targetUrl, undefined);
});

test('successful uploads replace WordPress fallback URLs', () => {
  const plan = createMediaPlan();
  const uploadedAttachment = {
    name: 'stored-example.png',
    url: 'stored-example.png',
    size: 123,
    type: 'image/png',
  };

  applyMediaToImportPlan(plan, {
    attachments: new Map([['attachment', uploadedAttachment]]),
    failures: [],
  });

  assert.deepEqual(plan.posts[0].images, [uploadedAttachment]);
  assert.deepEqual(plan.posts[0].thumbnail, uploadedAttachment);
  assert.equal(plan.posts[0].content.includes('stored-example.png'), true);
  assert.equal(plan.posts[0].content.includes(WORDPRESS_IMAGE_URL), false);
});
