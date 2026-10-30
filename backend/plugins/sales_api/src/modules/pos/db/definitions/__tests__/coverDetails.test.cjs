const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const mongoose = require('mongoose');

test('Sales persists terminal history per paidType without changing the cover description', () => {
  const filename = path.resolve(__dirname, '../covers.ts');
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
              mongooseStringRandomId: { type: String },
              schemaWrapper: (schema) => schema,
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
  const Model = db.model('SalesCoverPaymentHistory', schema);
  const cover = new Model({
    description: 'General note',
    details: [
      { paidType: 'cashAmount', paidSummary: [] },
      {
        paidType: 'TDBCard',
        paidSummary: [{ amount: 0 }],
        terminalResults: [
          {
            _id: 'tdb',
            bank: 'TDBCard',
            createdAt: new Date(),
            response: 'TDB result',
          },
        ],
      },
      {
        paidType: 'capitron',
        terminalResults: [
          {
            _id: 'cap',
            bank: 'capitron',
            createdAt: new Date(),
            response: 'Capitron result',
          },
        ],
      },
    ],
  }).toObject();
  assert.equal(cover.description, 'General note');
  assert.equal(cover.details[0].terminalResults.length, 0);
  assert.equal(cover.details[1].paidSummary[0].amount, 0);
  assert.equal(cover.details[1].terminalResults[0].response, 'TDB result');
  assert.equal(cover.details[2].terminalResults[0].response, 'Capitron result');
});
