const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function loadSource(file, dependencies, warnings = []) {
  const filename = path.resolve(__dirname, '..', file);
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const module = { exports: {} };
  vm.runInNewContext(
    outputText,
    {
      module,
      exports: module.exports,
      console: { warn: (...args) => warnings.push(args) },
      require: (name) => dependencies[name] || {},
    },
    { filename },
  );
  return module.exports;
}

test('startup removes the legacy scheduler and cleans failed jobs in batches', async () => {
  const events = [];
  let batch = 0;
  class Queue {
    constructor(name) {
      this.name = name;
    }
    async removeJobScheduler(id) {
      events.push(['remove', this.name, id]);
    }
    async clean(grace, limit, state) {
      assert.equal(grace, 0);
      assert.equal(limit, 1000);
      assert.equal(state, 'failed');
      events.push(['clean', this.name]);
      return batch++ === 0 ? Array(1000).fill('failed-job') : [];
    }
    async upsertJobScheduler(id, repeat, template) {
      assert.equal(this.name, 'posclient-hourly-sync-remainder');
      assert.equal(id, 'posclient-hourly-sync-remainder');
      assert.equal(repeat.pattern, '0 20 * * *');
      assert.equal(repeat.tz, 'UTC');
      assert.equal(template.opts.removeOnFail, true);
      assert.equal(template.opts.removeOnComplete, true);
      events.push(['schedule']);
    }
    async close() {
      events.push(['close', this.name]);
    }
  }
  const { initMQWorkers } = loadSource('index.ts', {
    bullmq: { Queue },
    'erxes-api-shared/utils': {
      createMQWorkerWithListeners: () => events.push(['worker']),
    },
  });
  await initMQWorkers({});
  assert.deepEqual(events[0], [
    'remove',
    'posclient-sync-remainder',
    'posclient-hourly-sync-remainder',
  ]);
  assert.equal(events.filter(([action]) => action === 'clean').length, 3);
  assert.equal(events.filter(([action]) => action === 'close').length, 2);
  assert.equal(events.filter(([action]) => action === 'worker').length, 2);
  assert.ok(events.findIndex(([action]) => action === 'schedule') > 3);
});

test('SaaS dispatch includes each tenant and removes terminal jobs', async () => {
  const calls = [];
  const { mainScheduler } = loadSource('hourlyRunner.ts', {
    'erxes-api-shared/utils': {
      getEnv: () => 'saas',
      getSaasOrganizations: async () => [
        { subdomain: 'first' },
        { subdomain: 'second' },
      ],
      sendWorkerQueue: () => ({
        add: async (name, data, opts) => calls.push({ name, data, opts }),
      }),
    },
  });
  await mainScheduler();
  assert.deepEqual(
    calls.map(({ data }) => data.subdomain),
    ['first', 'second'],
  );
  for (const { opts } of calls) {
    assert.equal(opts.removeOnFail, true);
    assert.equal(opts.removeOnComplete, true);
  }
});

test('SaaS dispatch skips organizations with invalid subdomains and continues valid tenants', async () => {
  const tenants = [];
  const warnings = [];
  const { mainScheduler } = loadSource(
    'hourlyRunner.ts',
    {
      'erxes-api-shared/utils': {
        getEnv: () => 'saas',
        getSaasOrganizations: async () => [
          { _id: 'missing' },
          { _id: 'null', subdomain: null },
          { _id: 'empty', subdomain: '' },
          { _id: 'blank', subdomain: '   ' },
          { _id: 'invalid', subdomain: 42 },
          { _id: 'valid', subdomain: 'tenant' },
        ],
        sendWorkerQueue: () => ({
          add: async (name, data) => tenants.push(data.subdomain),
        }),
      },
    },
    warnings,
  );
  await mainScheduler();
  assert.deepEqual(tenants, ['tenant']);
  assert.deepEqual(
    warnings.map(([, context]) => context.organizationId),
    ['missing', 'null', 'empty', 'blank', 'invalid'],
  );
});

test('missing tenant is skipped and removed without model access or retries', async () => {
  let modelAccess = false;
  const warnings = [];
  const { runner } = loadSource(
    'hourlyRunner.ts',
    {
      '~/connectionResolvers': {
        generateModels: async () => {
          modelAccess = true;
        },
      },
    },
    warnings,
  );
  for (const data of [
    undefined,
    {},
    { subdomain: null },
    { subdomain: '' },
    { subdomain: '   ' },
    { subdomain: 42 },
  ]) {
    const job = {
      id: 'legacy-job',
      name: 'posclient-sync-remainder',
      repeatJobKey: 'legacy-scheduler',
      data,
      opts: { attempts: 5, removeOnFail: { count: 5000 } },
    };
    const result = await runner(job);
    assert.equal(result.skipped, true);
    assert.equal(result.reason, 'missing-subdomain');
    assert.equal(job.opts.removeOnFail, true);
    assert.equal(job.opts.removeOnComplete, true);
  }
  assert.equal(warnings.length, 6);
  assert.equal(warnings[0][1].jobId, 'legacy-job');
  assert.equal(warnings[0][1].repeatJobKey, 'legacy-scheduler');
  assert.equal(modelAccess, false);
});

test('sync errors propagate with cleanup enabled for existing tenant jobs', async () => {
  const failure = new Error('Stock service unavailable');
  const { runner } = loadSource('hourlyRunner.ts', {
    '~/connectionResolvers': {
      generateModels: async (subdomain) => {
        assert.equal(subdomain, 'tenant');
        return {
          Configs: { find: () => ({ lean: async () => [{ token: 'pos' }] }) },
          Products: {
            find: () => ({ lean: async () => [{ _id: 'product' }] }),
          },
        };
      },
    },
    '~/modules/posclient/db/definitions/constants': {
      PRODUCT_STATUSES: { DELETED: 'deleted' },
    },
    '~/modules/posclient/utils/products': {
      syncRemainders: async () => {
        throw failure;
      },
    },
  });
  const job = { data: { subdomain: 'tenant' }, opts: { removeOnFail: false } };
  await assert.rejects(runner(job), (error) => error === failure);
  assert.equal(job.opts.removeOnFail, true);
});
