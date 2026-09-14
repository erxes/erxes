import assert from 'node:assert/strict';
import { spawn, ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { MongoClient } from 'mongodb';
import { buildPlan } from '../buildPlan';
import { loadSnapshot, runImport, writePlan } from '../importKnowledgeBase';
import { fingerprint } from '../fingerprint';
import {
  ImportOptions,
  Mapping,
  MAPPING_COLLECTION,
  RecordDocument,
} from '../types';
import { options, snapshot } from './fixtures';

let child: ChildProcess;
let client: MongoClient;
let directory: string;
let mongoUrl: string;
let sequence = 0;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'erxes-kb-mongo-'));
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const port = address.port;
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  child = spawn(
    'mongod',
    [
      '--dbpath',
      directory,
      '--bind_ip',
      '127.0.0.1',
      '--port',
      String(port),
      '--quiet',
    ],
    { stdio: 'ignore' },
  );
  let startupError: Error | undefined;
  child.on('error', (error) => {
    startupError = error;
  });
  mongoUrl = `mongodb://127.0.0.1:${port}/core?directConnection=true`;
  client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 1000 });
  for (let attempt = 0; attempt < 30; attempt++) {
    if (startupError)
      throw new Error(
        `Integration tests require mongod on PATH: ${startupError.message}`,
      );
    try {
      await client.connect();
      return;
    } catch {
      if (child.exitCode !== null)
        throw new Error('Temporary mongod exited during startup.');
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error('Temporary mongod did not start.');
});

after(async () => {
  await client?.close();
  if (child?.pid && child.exitCode === null) {
    const exited = once(child, 'exit');
    child.kill('SIGTERM');
    await exited;
  }
  if (directory) await rm(directory, { recursive: true, force: true });
});

const seed = async (): Promise<ImportOptions> => {
  const id = String(++sequence);
  const data = snapshot();
  const opts = {
    ...options(),
    mongoUrl,
    sourceSubdomain: `source${id}`,
    targetSubdomain: `target${id}`,
  };
  await client
    .db('core')
    .collection<RecordDocument>('organizations')
    .insertMany([
      { _id: opts.sourceSubdomain, subdomain: opts.sourceSubdomain },
      { _id: opts.targetSubdomain, subdomain: opts.targetSubdomain },
    ]);
  const source = client.db(`erxes_${opts.sourceSubdomain}`);
  const target = client.db(`erxes_${opts.targetSubdomain}`);
  await source
    .collection<RecordDocument>('knowledgebase_topics')
    .insertMany(data.topics);
  await source
    .collection<RecordDocument>('knowledgebase_categories')
    .insertMany(data.categories);
  await source
    .collection<RecordDocument>('knowledgebase_articles')
    .insertMany(data.articles);
  await source
    .collection<RecordDocument>('cms_translations')
    .insertMany(data.translations);
  await target
    .collection<RecordDocument>('client_portals')
    .insertOne({ _id: 'portal' });
  await target.collection<typeof data.cms>('content_cms').insertOne(data.cms);
  await target.collection<RecordDocument>('users').insertOne({ _id: 'author' });
  await target
    .collection('cms_posts')
    .createIndex({ slug: 1 }, { unique: true });
  await target
    .collection('cms_posts')
    .createIndex(
      { slug: 1, clientPortalId: 1 },
      { unique: true, sparse: true },
    );
  await target
    .collection('cms_categories')
    .createIndex({ slug: 1, clientPortalId: 1 }, { unique: true });
  await target
    .collection('cms_custom_post_types')
    .createIndex({ name: 1, clientPortalId: 1 }, { unique: true });
  await target
    .collection('cms_translations')
    .createIndex({ objectId: 1, language: 1, type: 1 }, { unique: true });
  return opts;
};

test('dry-run makes no writes or indexes; apply inserts valid documents and rerun changes nothing', async () => {
  const opts = await seed();
  const target = client.db(`erxes_${opts.targetSubdomain}`);
  const beforeCollections = await target
    .listCollections({}, { nameOnly: true })
    .toArray();
  const preview = await runImport(opts);
  assert.deepEqual(preview.errors, []);
  assert.equal(preview.inserted, 0);
  assert.deepEqual(
    await target.listCollections({}, { nameOnly: true }).toArray(),
    beforeCollections,
  );
  assert.equal(await target.collection('cms_posts').countDocuments(), 0);
  assert.equal(await target.collection(MAPPING_COLLECTION).countDocuments(), 0);
  const result = await runImport({ ...opts, dryRun: false });
  assert.deepEqual(result.errors, []);
  assert.equal(result.inserted, 6);
  assert.equal(await target.collection(MAPPING_COLLECTION).countDocuments(), 6);
  const post = await target.collection('cms_posts').findOne();
  assert.ok(post);
  assert.equal(post.clientPortalId, opts.clientPortalId);
  assert.equal(post.status, 'published');
  assert.equal(
    await target
      .collection('cms_categories')
      .countDocuments({ _id: { $in: post.categoryIds } }),
    3,
  );
  assert.equal(
    await target
      .collection('cms_custom_post_types')
      .countDocuments({ _id: post.type, code: 'knowledgebase' }),
    1,
  );
  const translated = await target
    .collection('cms_translations')
    .findOne({ objectId: post._id, language: 'en', type: 'post' });
  assert.equal(translated?.title, 'Create an account');
  const before = fingerprint(
    await target.collection('cms_posts').find().toArray(),
  );
  const rerun = await runImport({ ...opts, dryRun: false });
  assert.deepEqual(rerun.errors, []);
  assert.equal(rerun.inserted, 0);
  assert.equal(rerun.unchanged, 6);
  assert.equal(
    fingerprint(await target.collection('cms_posts').find().toArray()),
    before,
  );
  assert.equal(
    await client
      .db(`erxes_${opts.sourceSubdomain}`)
      .collection('knowledgebase_articles')
      .countDocuments(),
    1,
  );
});

test('a private source article blocks all writes, including metadata', async () => {
  const opts = await seed();
  await client
    .db(`erxes_${opts.sourceSubdomain}`)
    .collection('knowledgebase_articles')
    .updateMany({}, { $set: { isPrivate: true } });
  const report = await runImport({ ...opts, dryRun: false });
  assert.match(report.errors.join(), /non-private/);
  const target = client.db(`erxes_${opts.targetSubdomain}`);
  assert.equal(await target.collection(MAPPING_COLLECTION).countDocuments(), 0);
  assert.equal(await target.collection('cms_categories').countDocuments(), 0);
});

test('resumes a crash after reservations and one content insert without duplicating IDs', async () => {
  const opts = await seed();
  const data = await loadSnapshot(client, opts);
  const plan = buildPlan(data, opts);
  assert.deepEqual(plan.errors, []);
  const target = client.db(data.targetDb);
  await target
    .collection<Mapping>(MAPPING_COLLECTION)
    .insertMany(plan.mappings);
  const first = plan.mappings[0];
  await target
    .collection<RecordDocument>(first.targetCollection)
    .insertOne(first.targetDocument);
  const result = await runImport({ ...opts, dryRun: false });
  assert.deepEqual(result.errors, []);
  assert.equal(result.inserted, 5);
  assert.equal(result.unchanged, 1);
  const rows = await target
    .collection<Mapping>(MAPPING_COLLECTION)
    .find()
    .toArray();
  assert.deepEqual(
    rows.map((row) => row.targetDocument._id).sort(),
    plan.mappings.map((row) => row.targetDocument._id).sort(),
  );
});

test('preserves edited destination records and detects conflicting content inserted after preflight', async () => {
  const opts = await seed();
  const data = await loadSnapshot(client, opts);
  const plan = buildPlan(data, opts);
  const target = client.db(data.targetDb);
  const article = plan.mappings.find((row) => row.kind === 'article');
  assert.ok(article);
  await target
    .collection<RecordDocument>('cms_posts')
    .insertOne({ ...article.targetDocument, title: 'User work' });
  await assert.rejects(writePlan(target, data, plan, 2), /destination differs/);
  assert.equal(
    (
      await target
        .collection<RecordDocument>('cms_posts')
        .findOne({ _id: article.targetDocument._id })
    )?.title,
    'User work',
  );
  const report = await runImport({ ...opts, dryRun: false });
  assert.match(report.errors.join(), /edited/);
});

test('rejects unknown tenants, portals, authors and unsupported unique indexes', async () => {
  const opts = await seed();
  await assert.rejects(
    runImport({ ...opts, sourceSubdomain: 'missing' }),
    /organization/,
  );
  await assert.rejects(
    runImport({ ...opts, clientPortalId: 'missing' }),
    /client portal/,
  );
  await assert.rejects(
    runImport({ ...opts, authorMap: { author: 'missing' } }),
    /target author/,
  );
  const target = client.db(`erxes_${opts.targetSubdomain}`);
  await target
    .collection('cms_posts')
    .createIndex({ title: 1 }, { unique: true });
  const report = await runImport({ ...opts, dryRun: false });
  assert.match(report.errors.join(), /requires explicit collision/);
  assert.equal(await target.collection(MAPPING_COLLECTION).countDocuments(), 0);
});

test('checks actual global indexes and reuses an active existing knowledgebase type', async () => {
  const opts = await seed();
  const target = client.db(`erxes_${opts.targetSubdomain}`);
  await target.collection<RecordDocument>('cms_posts').insertOne({
    _id: 'other-portal',
    clientPortalId: 'another',
    slug: 'guide',
    count: 200,
  });
  await target.collection<RecordDocument>('cms_custom_post_types').insertOne({
    _id: 'existing-type',
    code: 'knowledgebase',
    name: 'kb',
    clientPortalId: 'portal',
    isActive: true,
  });
  const result = await runImport({ ...opts, dryRun: false });
  assert.deepEqual(result.errors, []);
  assert.equal(result.inserted, 5);
  const post = await target
    .collection('cms_posts')
    .findOne({ clientPortalId: 'portal' });
  assert.equal(post?.slug, 'guide_2');
  assert.equal(post?.count, 0);
  assert.equal(post?.type, 'existing-type');
  assert.equal(
    await target.collection('cms_custom_post_types').countDocuments(),
    1,
  );
});

test('topic selection excludes unrelated restricted content and inventory limits never truncate', async () => {
  const opts = await seed();
  const source = client.db(`erxes_${opts.sourceSubdomain}`);
  await source
    .collection<RecordDocument>('knowledgebase_topics')
    .insertOne({ _id: 'private-topic', title: 'Private', languageCode: 'mn' });
  await source
    .collection<RecordDocument>('knowledgebase_categories')
    .insertOne({
      _id: 'private-category',
      topicId: 'private-topic',
      title: 'Private category',
    });
  await source.collection<RecordDocument>('knowledgebase_articles').insertOne({
    _id: 'private-article',
    topicId: 'private-topic',
    categoryId: 'private-category',
    title: 'Private',
    content: 'Private content',
    isPrivate: true,
    status: 'publish',
  });
  assert.match((await runImport(opts)).errors.join(), /non-private/);
  await assert.rejects(
    runImport({ ...opts, maxBytes: 1 }),
    /inventory|Inventory/,
  );
  const report = await runImport({
    ...opts,
    topicIds: ['topic'],
    dryRun: false,
  });
  assert.deepEqual(report.errors, []);
  assert.equal(report.counts.articles, 1);
  const target = client.db(`erxes_${opts.targetSubdomain}`);
  assert.equal(
    await target
      .collection(MAPPING_COLLECTION)
      .countDocuments({ sourceId: 'private-article' }),
    0,
  );
});

test('supports same-tenant conversion and preserves the original KB documents', async () => {
  const opts = await seed();
  const target = client.db(`erxes_${opts.targetSubdomain}`);
  const data = snapshot();
  data.articles[0].image = {
    name: 'cover.png',
    type: 'image/png',
    url: '/uploads/cover.png',
  };
  await target
    .collection<RecordDocument>('knowledgebase_topics')
    .insertMany(data.topics);
  await target
    .collection<RecordDocument>('knowledgebase_categories')
    .insertMany(data.categories);
  await target
    .collection<RecordDocument>('knowledgebase_articles')
    .insertMany(data.articles);
  await target
    .collection<RecordDocument>('cms_translations')
    .insertMany(data.translations);
  const before = fingerprint(
    await target.collection('knowledgebase_articles').find().toArray(),
  );
  const report = await runImport({
    ...opts,
    sourceSubdomain: opts.targetSubdomain,
    dryRun: false,
  });
  assert.deepEqual(report.errors, []);
  assert.equal(report.inserted, 6);
  assert.equal(
    fingerprint(
      await target.collection('knowledgebase_articles').find().toArray(),
    ),
    before,
  );
  assert.equal(
    (await target.collection('cms_posts').findOne())?.thumbnail.url,
    '/uploads/cover.png',
  );
});
