import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildPlan } from '../buildPlan';
import { readOptions } from '../options';
import { fingerprint } from '../fingerprint';
import { options, snapshot } from './fixtures';

test('maps hierarchy, custom type ID, Mongolian content, publication, media and translations', () => {
  const data = snapshot();
  const plan = buildPlan(data, options());
  assert.deepEqual(plan.errors, []);
  assert.equal(plan.mappings.length, 6);
  const get = (kind: string, id?: string) => {
    const mapping = plan.mappings.find(
      (mapping) => mapping.kind === kind && (!id || mapping.sourceId === id),
    );
    assert.ok(mapping);
    return mapping;
  };
  const post = get('article').targetDocument;
  assert.equal(
    get('category', 'parent').targetDocument.parentId,
    get('topic').targetDocument._id,
  );
  assert.equal(
    get('category', 'child').targetDocument.parentId,
    get('category', 'parent').targetDocument._id,
  );
  assert.deepEqual(post.categoryIds, [
    get('category', 'child').targetDocument._id,
    get('category', 'parent').targetDocument._id,
    get('topic').targetDocument._id,
  ]);
  assert.equal(post.type, get('postType').targetDocument._id);
  assert.equal(post.status, 'published');
  assert.equal(post.content, data.articles[0].content);
  assert.equal(post.excerpt, 'Тусламж');
  assert.equal(post.authorId, 'author');
  assert.equal(post.viewCount, 17);
  assert.deepEqual(post.reactions, ['like']);
  assert.deepEqual(post.reactionCounts, { like: 3 });
  assert.deepEqual(post.createdAt, new Date('2024-01-01'));
  assert.deepEqual(post.publishedDate, new Date('2024-01-02'));
  assert.deepEqual(post.thumbnail, data.articles[0].image);
  assert.deepEqual(post.pdfAttachment, data.articles[0].pdfAttachment);
  assert.equal(get('translation').targetDocument.objectId, post._id);
  assert.equal(get('translation').targetDocument.type, 'post');
  assert.equal(get('topic').sourceDocument.color, '#000000');
  assert.deepEqual(get('article').sourceDocument.reactionCounts, {
    like: 3,
    legacy: 2,
  });
});

test('blocks private and every non-public status, even when missing', () => {
  for (const status of [
    'draft',
    'scheduled',
    'archived',
    'published',
    undefined,
  ]) {
    const data = snapshot();
    data.articles[0].status = status;
    const plan = buildPlan(data, options());
    assert.match(plan.errors.join(), /current CMS portal reads/);
    assert.equal(plan.mappings.length, 0);
  }
  for (const privateValue of [true, 'false', 1, null]) {
    const data = snapshot();
    data.articles[0].isPrivate = privateValue;
    assert.match(buildPlan(data, options()).errors.join(), /non-private/);
  }
});

test('blocks cycles, cross-topic parents, missing categories and conflicting membership', () => {
  const cycle = snapshot();
  cycle.categories[0].parentCategoryId = 'child';
  assert.match(buildPlan(cycle, options()).errors.join(), /cycle/);
  const missing = snapshot();
  missing.articles[0].categoryId = 'missing';
  assert.match(buildPlan(missing, options()).errors.join(), /missing category/);
  const conflict = snapshot();
  conflict.topics[0].categoryIds = ['missing'];
  assert.match(buildPlan(conflict, options()).errors.join(), /categoryIds/);
  const cross = snapshot();
  cross.categories[0].topicId = 'another';
  assert.match(buildPlan(cross, options()).errors.join(), /cross-topic/);
  const malformed = snapshot();
  malformed.categories[0].parentCategoryId = 42;
  assert.match(
    buildPlan(malformed, options()).errors.join(),
    /expected a string ID/,
  );
  const stale = snapshot();
  stale.topics[0].categoryIds = [];
  stale.categories[1].articleIds = [];
  const plan = buildPlan(stale, options());
  assert.deepEqual(plan.errors, []);
  assert.match(plan.warnings.join(), /incomplete/);
});

test('resolves slugs globally, allocates portal counts, and keeps topic/category identities distinct', () => {
  const data = snapshot();
  data.target.cms_posts.push({
    _id: 'foreign',
    clientPortalId: 'another-portal',
    slug: 'guide',
    count: 90,
  });
  data.target.cms_posts.push({
    _id: 'local',
    clientPortalId: 'portal',
    slug: 'other',
    count: 8,
  });
  data.categories[0]._id = 'topic';
  data.categories[1].parentCategoryId = 'topic';
  data.topics[0].categoryIds = ['topic', 'child'];
  const plan = buildPlan(data, options());
  assert.deepEqual(plan.errors, []);
  assert.equal(
    plan.mappings.find((mapping) => mapping.kind === 'article')?.targetDocument
      .slug,
    'guide_2',
  );
  assert.equal(
    plan.mappings.find((mapping) => mapping.kind === 'article')?.targetDocument
      .count,
    9,
  );
  assert.notEqual(
    plan.mappings.find((mapping) => mapping.kind === 'topic')?.targetDocument
      ._id,
    plan.mappings.find((mapping) => mapping.kind === 'category')?.targetDocument
      ._id,
  );
});

test('resumes reservations with stable IDs and preserves live metrics; rejects source/destination edits', () => {
  const data = snapshot();
  const first = buildPlan(data, options());
  data.mappings = first.mappings;
  for (const mapping of first.mappings)
    data.target[mapping.targetCollection].push(
      structuredClone(mapping.targetDocument),
    );
  const post = data.target.cms_posts[0];
  post.viewCount = 25;
  post.reactionCounts = { like: 9 };
  post.updatedAt = new Date();
  data.articles[0].viewCount = 30;
  data.articles[0].updatedAt = new Date();
  const again = buildPlan(data, options());
  assert.deepEqual(again.errors, []);
  assert.deepEqual(again.mappings, first.mappings);
  post.title = 'Edited in CMS';
  assert.match(buildPlan(data, options()).errors.join(), /edited/);
  const original = first.mappings.find((mapping) => mapping.kind === 'article');
  assert.ok(original);
  post.title = original.targetDocument.title;
  data.articles[0].content = '<p>Changed source</p>';
  assert.match(buildPlan(data, options()).errors.join(), /changed since/);
});

test('requires valid authors and aligns base and translation languages', () => {
  const data = snapshot();
  data.userIds.clear();
  assert.match(buildPlan(data, options()).errors.join(), /Author is missing/);
  data.userIds.add('admin');
  assert.deepEqual(
    buildPlan(data, { ...options(), fallbackAuthorId: 'admin' }).errors,
    [],
  );
  data.topics[0].languageCode = 'en';
  assert.match(buildPlan(data, options()).errors.join(), /differs from/);
  data.topics[0].languageCode = 'mn';
  data.userIds.add('author');
  data.translations[0].language = 'mn';
  assert.match(buildPlan(data, options()).errors.join(), /Default-language/);
});

test('rewrites only explicit article links and validates relative media including PDFs', () => {
  const data = snapshot();
  data.articles[0].content =
    '<p><a href="https://old.example.com/kb/article#top">Read</a> https://old.example.com/kb/article</p>';
  const opts = {
    ...options(),
    sourceArticleUrlTemplate: 'https://old.example.com/kb/{id}',
  };
  const plan = buildPlan(data, opts);
  assert.deepEqual(plan.errors, []);
  const mapping = plan.mappings.find((row) => row.kind === 'article');
  assert.ok(mapping);
  assert.equal(mapping.targetUrl, 'https://help.example.com/articles/guide');
  assert.equal(
    mapping.targetDocument.content,
    '<p><a href="https://help.example.com/articles/guide#top">Read</a> https://old.example.com/kb/article</p>',
  );
  data.articles[0].image = {
    name: 'cover',
    type: 'image/png',
    url: '/uploads/cover.png',
  };
  assert.match(buildPlan(data, opts).errors.join(), /KB_MEDIA_BASE_URL/);
  assert.deepEqual(
    buildPlan(data, { ...opts, mediaBaseUrl: 'https://files.example.com/' })
      .errors,
    [],
  );
  data.articles[0].pdfAttachment = {
    pdf: { name: 'pdf', type: 'application/pdf', url: 'javascript:alert(1)' },
    pages: [],
  };
  assert.match(
    buildPlan(data, {
      ...opts,
      mediaBaseUrl: 'https://files.example.com/',
    }).errors.join(),
    /scheme/,
  );
});

test('validates configuration and defaults to a real read-only dry run', () => {
  const env = {
    MONGO_URL: 'mongodb://localhost/core',
    SOURCE_SUBDOMAIN: 'a',
    TARGET_SUBDOMAIN: 'b',
    CLIENT_PORTAL_ID: 'p',
  };
  assert.equal(readOptions(env).dryRun, true);
  assert.equal(readOptions({ ...env, DRY_RUN: '0' }).dryRun, false);
  assert.throws(() => readOptions({ ...env, DRY_RUN: 'no' }), /DRY_RUN/);
  assert.throws(() => readOptions({ ...env, BATCH_SIZE: '0' }), /positive/);
  assert.throws(
    () => readOptions({ ...env, KB_AUTHOR_MAP: '{"a":2}' }),
    /user IDs/,
  );
  assert.throws(
    () =>
      readOptions({
        ...env,
        KB_ARTICLE_URL_TEMPLATE: 'https://example.com/no-id',
      }),
    /\{id\}/,
  );
  assert.equal(
    fingerprint({ b: 2, a: new Date('2024-01-01') }),
    fingerprint({ a: new Date('2024-01-01'), b: 2 }),
  );
});
