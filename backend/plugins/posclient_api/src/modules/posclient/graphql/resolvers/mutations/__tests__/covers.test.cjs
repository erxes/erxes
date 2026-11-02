const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const { z } = require('zod');

function fixture(overrides = {}) {
  let cover = {
    _id: 'cover',
    posToken: 'pos',
    createdBy: 'user',
    status: 'new',
    endDate: new Date(),
    description: 'Note',
    details: [],
    ...overrides,
  };
  const calls = [];
  let sendError;
  let lockAllowed = true;
  let auditError;
  let deleteAllowed = true;
  const models = {
    OrderChangeLogs: {
      createLog: async (doc) => {
        calls.push({ audit: doc });
        if (auditError) throw auditError;
        return { ...doc, _id: 'audit' };
      },
      deleteOne: async (filter) => {
        calls.push({ removedAudit: filter });
      },
    },
    Covers: {
      getCover: async () => {
        calls.push('read');
        return cover;
      },
      createCover: async (doc) => {
        calls.push('create');
        return doc;
      },
      findOneAndUpdate: (filter, update) => ({
        lean: async () => {
          calls.push({ filter, update });
          if (!lockAllowed) return null;
          if (Array.isArray(update)) {
            for (const [key, value] of Object.entries(update[0].$set)) {
              if (value && typeof value === 'object' && '$literal' in value)
                cover = { ...cover, [key]: value.$literal };
            }
          }
          if (update.$set?.status === 'confirming')
            cover = { ...cover, status: 'confirming' };
          return cover;
        },
      }),
      updateOne: async (filter, update) => {
        calls.push({ filter, update });
        cover = { ...cover, ...update.$set };
      },
      deleteOne: async (filter) => {
        calls.push({ deleted: filter });
        return { acknowledged: true, deletedCount: deleteAllowed ? 1 : 0 };
      },
    },
  };
  const filename = path.resolve(__dirname, '../covers.ts');
  const mod = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      module: mod,
      exports: mod.exports,
      require: (id) => {
        if (id === '~/modules/posclient/utils/coverChangeLogs') {
          const audit = { exports: {} };
          const auditFile = path.resolve(
            __dirname,
            '../../../../utils/coverChangeLogs.ts',
          );
          vm.runInNewContext(
            ts.transpileModule(readFileSync(auditFile, 'utf8'), {
              compilerOptions: { module: ts.ModuleKind.CommonJS },
            }).outputText,
            { module: audit, exports: audit.exports },
            { filename: auditFile },
          );
          return audit.exports;
        }
        if (id === '~/modules/posclient/utils/coverTerminalResults') {
          const util = { exports: {} };
          const utilFile = path.resolve(
            __dirname,
            '../../../../utils/coverTerminalResults.ts',
          );
          vm.runInNewContext(
            ts.transpileModule(readFileSync(utilFile, 'utf8'), {
              compilerOptions: { module: ts.ModuleKind.CommonJS },
            }).outputText,
            {
              module: util,
              exports: util.exports,
              require: (id) =>
                id === 'nanoid' ? require('nanoid') : undefined,
            },
            { filename: utilFile },
          );
          return util.exports;
        }
        if (id === 'zod') return { z };
        if (id === 'erxes-api-shared/utils')
          return {
            markResolvers: () => {},
            sendTRPCMessage: async (request) => {
              calls.push({ sent: request });
              if (sendError) throw sendError;
              return { _id: 'cover' };
            },
          };
        throw new Error(`Unexpected import: ${id}`);
      },
    },
    { filename },
  );
  const context = {
    models,
    config: { token: 'pos', adminIds: ['admin'] },
    posUser: { _id: 'user' },
    subdomain: 'tenant',
  };
  return {
    mutations: mod.exports.coverMutations,
    context,
    calls,
    read: () => cover,
    failSend: () => {
      sendError = new Error('Sales unavailable');
    },
    failAudit: () => {
      auditError = new Error('Audit unavailable');
    },
    refuseDelete: () => {
      deleteAllowed = false;
    },
    refuseLock: () => {
      lockAllowed = false;
    },
  };
}
const entry = {
  _id: 'fetch',
  bank: 'TDBCard',
  createdAt: new Date(),
  response: '{"total":10}',
};

test('draft creation forces an editable status and the authenticated POS scope', async () => {
  const f = fixture();
  const saved = await f.mutations.coversAdd(
    null,
    { status: 'confirm', posToken: 'other' },
    f.context,
  );
  assert.equal(saved.status, 'new');
  assert.equal(saved.posToken, 'pos');
  assert.equal(saved.createdBy, 'user');
});
for (const name of [
  'coversEdit',
  'coversRemove',
  'coversConfirm',
  'posclientCoverTerminalResultSave',
]) {
  test(`${name} requires login before reading a cover`, async () => {
    const f = fixture();
    f.context.posUser = undefined;
    await assert.rejects(
      f.mutations[name](
        null,
        { _id: 'cover', resultId: 'fetch', bank: 'TDBCard' },
        f.context,
      ),
      /Must login/,
    );
    assert.equal(f.calls.length, 0);
  });
}
for (const override of [
  { posToken: 'other' },
  { createdBy: 'other' },
  { status: 'confirm' },
  { status: 'confirming' },
]) {
  test(`terminal writes reject invalid scope/status ${JSON.stringify(
    override,
  )}`, async () => {
    const f = fixture(override);
    await assert.rejects(
      f.mutations.posclientCoverTerminalResultSave(
        null,
        { _id: 'cover', resultId: 'fetch', bank: 'TDBCard' },
        f.context,
      ),
      /Cannot/,
    );
    assert.deepEqual(f.calls, ['read']);
  });
}
test('unpublished cover deletion archives its full terminal history before deleting', async () => {
  const f = fixture({
    status: 'reconf',
    details: [{ paidType: 'TDBCard', terminalResults: [entry] }],
  });
  const result = await f.mutations.coversRemove(
    null,
    { _id: 'cover' },
    f.context,
  );
  const audit = f.calls.find((call) => call.audit).audit;
  assert.equal(result.deletedCount, 1);
  assert.equal(audit.source, 'cover');
  assert.equal(audit.action, 'delete');
  assert.equal(audit.coverId, 'cover');
  assert.equal(audit.posToken, 'pos');
  assert.equal(audit.userId, 'user');
  assert.equal(
    audit.changes[0].oldValue.details[0].terminalResults[0].response,
    entry.response,
  );
  assert.equal(audit.changes[0].newValue, null);
  assert.ok(
    f.calls.findIndex((call) => call.audit) <
      f.calls.findIndex((call) => call.deleted),
  );
});
test('failed terminal responses can be deleted after their snapshot is archived', async () => {
  const f = fixture({
    details: [
      {
        paidType: 'TDBCard',
        terminalResults: [{ ...entry, response: '{"error":"timeout"}' }],
      },
    ],
  });
  await f.mutations.coversRemove(null, { _id: 'cover' }, f.context);
  assert.equal(
    f.calls.find((call) => call.audit).audit.changes[0].oldValue.details[0]
      .terminalResults[0].response,
    '{"error":"timeout"}',
  );
});
test('an audit failure preserves the live cover', async () => {
  const f = fixture();
  f.failAudit();
  await assert.rejects(
    f.mutations.coversRemove(null, { _id: 'cover' }, f.context),
    /Audit unavailable/,
  );
  assert.equal(
    f.calls.some((call) => call.deleted),
    false,
  );
});
test('deletion only removes the archived snapshot, never a concurrent terminal result', async () => {
  const f = fixture();
  await f.mutations.coversRemove(null, { _id: 'cover' }, f.context);
  const filter = f.calls.find((call) => call.deleted).deleted;
  assert.equal(filter.posToken, 'pos');
  assert.equal(filter.status, 'new');
  assert.equal(filter.$expr.$eq[1].$literal, f.read().details);
  assert.equal(filter.details, undefined);
  assert.equal(filter.modifiedAt, f.read().modifiedAt);
  f.refuseDelete();
  await assert.rejects(
    f.mutations.coversRemove(null, { _id: 'cover' }, f.context),
    /Cover changed/,
  );
  const cleanup = f.calls.find((call) => call.removedAudit).removedAudit;
  assert.equal(cleanup._id, 'audit');
  assert.equal(cleanup.source, 'cover');
  assert.equal(cleanup.posToken, 'pos');
});
test('repeating a completed result is idempotent and cannot replace its response', async () => {
  const f = fixture({
    details: [
      {
        paidType: 'TDBCard',
        terminalResults: [entry],
      },
    ],
  });
  const args = {
    _id: 'cover',
    resultId: 'fetch',
    bank: 'TDBCard',
    response: entry.response,
  };
  await f.mutations.posclientCoverTerminalResultSave(null, args, f.context);
  await assert.rejects(
    f.mutations.posclientCoverTerminalResultSave(
      null,
      { ...args, response: 'changed' },
      f.context,
    ),
    /cannot be replaced/,
  );
  assert.deepEqual(f.calls, ['read', 'read']);
});
test('a result must have a server-side reservation before completion', async () => {
  const f = fixture();
  await assert.rejects(
    f.mutations.posclientCoverTerminalResultSave(
      null,
      { _id: 'cover', resultId: 'missing', bank: 'TDBCard', response: '{}' },
      f.context,
    ),
    /Reserve/,
  );
});
test('publishing refuses a pending terminal fetch before calling Sales', async () => {
  const f = fixture({
    details: [
      {
        paidType: 'TDBCard',
        terminalResults: [{ ...entry, response: undefined }],
      },
    ],
  });
  f.refuseLock();
  await assert.rejects(
    f.mutations.coversConfirm(null, { _id: 'cover' }, f.context),
    /pending/,
  );
  assert.equal(
    f.calls.some((call) => call.sent),
    false,
  );
});
test('publishing preserves the general note and per-payment histories', async () => {
  const f = fixture({
    details: [
      {
        paidType: 'TDBCard',
        terminalResults: [entry],
      },
    ],
  });
  await f.mutations.coversConfirm(null, { _id: 'cover' }, f.context);
  const request = f.calls.find((call) => call.sent).sent;
  assert.equal(request.subdomain, 'tenant');
  assert.equal(request.throwOnError, true);
  assert.equal(request.input.cover.description, 'Note');
  assert.equal(
    request.input.cover.details[0].terminalResults[0].response,
    entry.response,
  );
  assert.equal(request.input.cover.status, 'confirm');
  assert.equal(f.read().status, 'confirm');
});
test('Sales transport failure restores editable state without removing terminal results', async () => {
  const f = fixture({
    details: [
      {
        paidType: 'TDBCard',
        terminalResults: [entry],
      },
    ],
    status: 'reconf',
  });
  f.failSend();
  await assert.rejects(
    f.mutations.coversConfirm(null, { _id: 'cover' }, f.context),
    /Sales unavailable/,
  );
  assert.equal(f.read().status, 'reconf');
  assert.equal(f.read().details[0].terminalResults[0].response, entry.response);
});

test('POS client cover documents match the public cover GraphQL contract', () => {
  const { buildSchema, validate } = require('graphql');
  const gql = require('graphql-tag');
  const load = (filename, dependencies = {}) => {
    const mod = { exports: {} };
    vm.runInNewContext(
      ts.transpileModule(readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS },
      }).outputText,
      { module: mod, exports: mod.exports, require: (id) => dependencies[id] },
      { filename },
    );
    return mod.exports;
  };
  const contract = load(path.resolve(__dirname, '../../../schemas/covers.ts'));
  const schema = buildSchema(
    `scalar JSON scalar Date type PosUser { email: String } ${contract.types} type Query { ${contract.queries} } type Mutation { ${contract.mutations} }`,
  );
  const app = path.resolve(
    process.cwd(),
    'apps/posclient-front/app/(main)/cover/graphql',
  );
  for (const [file, name] of [
    ['queries.ts', 'queries'],
    ['mutations.ts', 'mutations'],
  ]) {
    const documents = load(path.join(app, file), {
      '@apollo/client': { gql },
      './fields': load(path.join(app, 'fields.ts')),
    })[name];
    for (const [operation, document] of Object.entries(documents)) {
      assert.deepEqual(
        validate(schema, document).map((error) => error.message),
        [],
        operation,
      );
    }
  }
});

test('opening a draft persists it without making it publishable', async () => {
  const f = fixture({ status: 'draft' });
  const saved = await f.mutations.coversAdd(
    null,
    { status: 'draft' },
    f.context,
  );
  assert.equal(saved.status, 'draft');
  await assert.rejects(
    f.mutations.coversConfirm(null, { _id: 'cover' }, f.context),
    /Calculate cover amounts/,
  );
  assert.equal(
    f.calls.some((call) => call.sent),
    false,
  );
});

test('unfinished drafts do not move the previous-cover amount boundary', async () => {
  const filename = path.resolve(__dirname, '../../queries/covers.ts');
  const mod = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      module: mod,
      exports: mod.exports,
      require: () => ({ markResolvers: () => {}, getPureDate: (date) => date }),
    },
    { filename },
  );
  const previous = {
    _id: 'previous',
    status: 'new',
    endDate: new Date('2026-10-27T00:00:00Z'),
  };
  const draft = {
    _id: 'draft',
    status: 'draft',
    endDate: new Date('2026-10-28T00:00:00Z'),
  };
  let orderFilter;
  const models = {
    Covers: {
      findOne: (filter) => ({
        sort: () => ({
          lean: async () =>
            [draft, previous].find(
              (cover) =>
                cover.status !== filter.status.$ne &&
                cover._id !== filter._id?.$ne,
            ),
        }),
      }),
    },
    Orders: {
      find: (filter) => {
        orderFilter = filter;
        return { lean: async () => [] };
      },
    },
  };
  const result = await mod.exports.coverQueries.coverAmounts(
    null,
    { _id: 'current', endDate: new Date('2026-10-28T01:00:00Z') },
    {
      models,
      posUser: { _id: 'user' },
      config: { token: 'pos' },
    },
  );
  assert.equal(result.startDate, previous.endDate);
  assert.equal(orderFilter.paidDate.$gte, previous.endDate);
});

test('a publish interrupted while confirming can retry the same stored snapshot', async () => {
  const f = fixture({
    status: 'confirming',
    details: [
      {
        paidType: 'TDBCard',
        terminalResults: [entry],
      },
    ],
  });
  await f.mutations.coversConfirm(null, { _id: 'cover' }, f.context);
  assert.equal(f.read().status, 'confirm');
  assert.equal(f.calls.filter((call) => call.sent).length, 1);
});

test('terminal fields belong to payment detail schemas, never the cover root', () => {
  const mongoose = require('mongoose');
  const filename = path.resolve(
    __dirname,
    '../../../../db/definitions/covers.ts',
  );
  const mod = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      module: mod,
      exports: mod.exports,
      require: (id) =>
        id === 'mongoose'
          ? mongoose
          : {
              field: (value) => (value.pkey ? { type: String } : value),
              schemaHooksWrapper: (schema) => schema,
            },
    },
    { filename },
  );
  const schema = mod.exports.coverSchema;
  assert.equal(schema.path('terminalResults'), undefined);
  assert.ok(schema.path('details').schema.path('terminalResults'));
  for (const field of [
    'description',
    'terminalDescription',
    'terminalBaseDescription',
  ]) {
    assert.equal(schema.path('details').schema.path(field), undefined);
  }
  const db = new mongoose.Mongoose();
  const Model = db.model('CoverPaymentOwnership', schema);
  const cover = new Model({
    description: 'General note',
    details: [
      { paidType: 'cashAmount', paidSummary: [] },
      {
        paidType: 'TDBCard',
        terminalResults: [entry],
      },
    ],
  }).toObject();
  assert.equal(cover.description, 'General note');
  assert.equal(cover.details[0].terminalResults.length, 0);
  assert.equal(cover.details[1].terminalResults[0].response, entry.response);
});

test('deletion snapshot comparison survives Mongoose casting of legacy payment rows', () => {
  const mongoose = require('mongoose');
  const filename = path.resolve(
    __dirname,
    '../../../../db/definitions/covers.ts',
  );
  const mod = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      module: mod,
      exports: mod.exports,
      require: (id) =>
        id === 'mongoose'
          ? mongoose
          : {
              field: (options) => (options.pkey ? { type: String } : options),
              schemaHooksWrapper: (schema) => schema,
            },
    },
    { filename },
  );
  const db = new mongoose.Mongoose();
  const Model = db.model('CoverDeleteSnapshotCasting', mod.exports.coverSchema);
  // Pipeline-created/legacy nonterminal rows have no stored terminalResults field.
  const details = [{ _id: 'cash', paidType: 'cashAmount', paidSummary: [] }];
  const oldQuery = Model.deleteOne({ details });
  oldQuery.cast(Model);
  assert.ok(oldQuery.getFilter().details[0].terminalResults);
  const query = Model.deleteOne({
    $expr: { $eq: [{ $ifNull: ['$details', []] }, { $literal: details }] },
  });
  query.cast(Model);
  assert.deepEqual(query.getFilter().$expr.$eq[1].$literal, details);
  assert.equal(
    query.getFilter().$expr.$eq[1].$literal[0].terminalResults,
    undefined,
  );
});

test('an edited POS closing description is saved and sent unchanged to Sales', async () => {
  const f = fixture({ description: 'Old note' });
  const description = 'Хаалтын тэмдэглэл\nКассын тайлбар: 12500₮';
  await f.mutations.coversEdit(null, { _id: 'cover', description }, f.context);
  assert.equal(f.read().description, description);
  await f.mutations.coversConfirm(null, { _id: 'cover' }, f.context);
  assert.equal(
    f.calls.find((call) => call.sent).sent.input.cover.description,
    description,
  );
});
