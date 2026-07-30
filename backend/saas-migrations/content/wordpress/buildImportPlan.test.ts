import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildImportPlan } from './buildImportPlan';
import type { WordPressExport, WordPressItem } from './types';

const createItem = (overrides: Partial<WordPressItem>): WordPressItem => ({
  id: '1',
  title: 'Example',
  link: 'https://wordpress.example/example',
  creatorLogin: 'admin',
  content: '',
  excerpt: '',
  postDate: '2026-01-01 00:00:00',
  postDateGmt: '2026-01-01 00:00:00',
  modifiedDate: '2026-01-01 00:00:00',
  modifiedDateGmt: '2026-01-01 00:00:00',
  commentStatus: 'closed',
  slug: 'example',
  status: 'publish',
  parentId: '0',
  menuOrder: 0,
  postType: 'post',
  postPassword: '',
  isSticky: false,
  attachmentUrl: '',
  taxonomies: [],
  meta: {},
  commentCount: 0,
  ...overrides,
});

const createExport = (items: WordPressItem[]): WordPressExport => ({
  site: {
    title: 'Example site',
    description: 'Example description',
    link: 'https://wordpress.example',
    language: 'en-US',
    baseSiteUrl: 'https://wordpress.example',
    baseBlogUrl: 'https://wordpress.example',
    wxrVersion: '1.2',
  },
  authors: [],
  terms: [],
  items,
});

const createPlan = (
  items: WordPressItem[],
  existingMappings?: ReturnType<typeof buildImportPlan>['mappings'],
) => {
  let nextId = 0;

  return buildImportPlan(createExport(items), {
    clientPortalId: 'portal',
    adminUserId: 'admin',
    existingMappings,
    idGenerator: () => `generated_${++nextId}`,
    now: new Date('2026-01-01T00:00:00.000Z'),
  });
};

describe('WordPress ACF custom field import', () => {
  it('preserves the ACF field key and imports available definition metadata', () => {
    const acfField = createItem({
      id: '100',
      title: 'Preferred Size',
      slug: 'field_size123',
      excerpt: 'size',
      postType: 'acf-field',
      parentId: '99',
      content:
        'a:5:{s:4:"type";s:6:"select";s:8:"required";i:1;s:12:"instructions";s:14:"Choose a size.";s:7:"choices";a:2:{s:5:"small";s:5:"Small";s:5:"large";s:5:"Large";}s:8:"multiple";i:0;}',
    });
    const page = createItem({
      id: '10',
      title: 'Gallery page',
      slug: 'gallery-page',
      postType: 'page',
      meta: {
        size: ['small'],
        _size: ['field_size123'],
      },
    });
    const plan = createPlan([acfField, page]);
    const field = plan.customFieldGroups[0].fields[0];

    assert.equal(field._id, 'field_size123');
    assert.equal(field.label, 'Preferred Size');
    assert.equal(field.code, 'size');
    assert.equal(field.type, 'select');
    assert.equal(field.description, 'Choose a size.');
    assert.equal(field.isRequired, true);
    assert.deepEqual(field.options, ['small', 'large']);
    assert.deepEqual(plan.pages[0].customFieldsData, [
      {
        field: 'field_size123',
        value: 'small',
      },
    ]);
    assert.ok(
      plan.mappings.some(
        ({ sourceType, sourceId, targetId, targetCollection }) =>
          sourceType === 'acf-field' &&
          sourceId === 'field_size123' &&
          targetId === 'field_size123' &&
          targetCollection === 'cms_custom_field_groups.fields',
      ),
    );
  });

  it('keeps different ACF keys separate when their public meta names match', () => {
    const firstPost = createItem({
      id: '10',
      title: 'First gallery',
      slug: 'first-gallery',
      meta: {
        gallery: ['first'],
        _gallery: ['field_gallery_a'],
      },
    });
    const secondPost = createItem({
      id: '11',
      title: 'Second gallery',
      slug: 'second-gallery',
      meta: {
        gallery: ['second'],
        _gallery: ['field_gallery_b'],
      },
    });
    const plan = createPlan([firstPost, secondPost]);
    const fields = plan.customFieldGroups[0].fields;

    assert.deepEqual(
      new Set(fields.map(({ _id }) => _id)),
      new Set(['field_gallery_a', 'field_gallery_b']),
    );
    assert.equal(new Set(fields.map(({ code }) => code)).size, 2);
    assert.deepEqual(
      new Set(
        plan.posts.flatMap(({ customFieldsData }) =>
          customFieldsData.map(({ field }) => field),
        ),
      ),
      new Set(['field_gallery_a', 'field_gallery_b']),
    );
  });

  it('deduplicates a shared ACF key mapping across page and post groups', () => {
    const page = createItem({
      id: '10',
      title: 'Page',
      slug: 'page',
      postType: 'page',
      meta: {
        keywords: ['page keywords'],
        _keywords: ['field_shared_keywords'],
      },
    });
    const post = createItem({
      id: '11',
      title: 'Post',
      slug: 'post',
      meta: {
        keywords: ['post keywords'],
        _keywords: ['field_shared_keywords'],
      },
    });
    const plan = createPlan([page, post]);
    const fieldMappings = plan.mappings.filter(
      ({ sourceType, sourceId, targetCollection }) =>
        sourceType === 'acf-field' &&
        sourceId === 'field_shared_keywords' &&
        targetCollection === 'cms_custom_field_groups.fields',
    );

    assert.equal(plan.customFieldGroups.length, 2);
    assert.ok(
      plan.customFieldGroups.every(({ fields }) =>
        fields.some(({ _id }) => _id === 'field_shared_keywords'),
      ),
    );
    assert.equal(fieldMappings.length, 1);
  });

  it('retains stable generated IDs for metadata without an ACF key', () => {
    const post = createItem({
      id: '10',
      meta: {
        campaign_source: ['summer'],
      },
    });
    const firstPlan = createPlan([post]);
    const firstField = firstPlan.customFieldGroups[0].fields[0];
    const secondPlan = createPlan([post], firstPlan.mappings);
    const secondField = secondPlan.customFieldGroups[0].fields[0];

    assert.equal(firstField._id, secondField._id);
    assert.equal(firstPlan.posts[0].customFieldsData[0].field, firstField._id);
    assert.equal(secondPlan.posts[0].customFieldsData[0].field, firstField._id);
    assert.equal(firstField._id.startsWith('field_'), false);
  });
});
