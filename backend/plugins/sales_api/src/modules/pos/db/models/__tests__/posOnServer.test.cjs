const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function fixture() {
  let Pos;
  let stored = { _id: 'pos', name: 'Old POS', onServer: false };
  const schema = { loadClass: (model) => (Pos = model) };
  const models = {
    Pos: {
      create: async (doc) => {
        stored = { _id: 'pos', ...doc };
        return { ...stored, toObject: () => ({ ...stored }) };
      },
      getPos: async () => ({ ...stored }),
      updateOne: async (filter, update) => {
        assert.equal(filter._id, 'pos');
        stored = { ...stored, ...update.$set };
      },
      findOne: () => ({ lean: async () => ({ ...stored }) }),
    },
  };
  const filename = path.resolve(__dirname, '../Pos.ts');
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const module = { exports: {} };
  vm.runInNewContext(
    outputText,
    {
      module,
      exports: module.exports,
      require: (id) => {
        if (id === '../definitions/pos') return { posSchema: schema };
        if (id === '../../customerCreateConfig') {
          return { validateCustomerCreateConfig: () => {} };
        }
        if (id === '../../orderPoints') return { validateEarnTier: () => {} };
        throw new Error(`Unexpected runtime dependency: ${id}`);
      },
    },
    { filename },
  );
  module.exports.loadPosClass(models, 'tenant', { sendDbEventLog: () => {} });
  return { Pos, read: () => stored };
}

for (const onServer of [false, undefined, true]) {
  const doc = {
    name: 'Updated POS',
    ...(onServer === undefined ? {} : { onServer }),
  };

  test(`POS add always stores onServer=true when input is ${onServer}`, async () => {
    const { Pos, read } = fixture();
    const result = await Pos.posAdd({ _id: 'user' }, doc);
    assert.equal(read().onServer, true);
    assert.equal(result.onServer, true);
    assert.equal(result.name, doc.name);
    assert.equal(result.userId, 'user');
    assert.ok(result.token);
  });

  test(`POS edit upgrades an offline config when input is ${onServer}`, async () => {
    const { Pos, read } = fixture();
    const result = await Pos.posEdit('pos', doc);
    assert.equal(read().onServer, true);
    assert.equal(result.onServer, true);
    assert.equal(result.name, doc.name);
  });
}
