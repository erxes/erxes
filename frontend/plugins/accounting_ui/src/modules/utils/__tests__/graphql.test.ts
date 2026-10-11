import { strict as assert } from 'node:assert';
import { toGraphqlView } from '../graphql';
import { formatDate } from '../graphqlDate';

test('normalizes missing fields and rejects unidentified entity rows', () => {
  const input = {
    list: [
      null,
      { _id: null },
      { _id: '', name: 'invalid' },
      { _id: 'account', name: null },
    ],
    description: null,
  };
  assert.deepEqual(toGraphqlView(input), {
    list: [{ _id: 'account', name: undefined }],
    description: undefined,
  });
  assert.equal(input.list.length, 4);
});

test('retains immutable Apollo result identity across renders', () => {
  const row = Object.freeze({ _id: 'account', name: 'Cash' });
  const input = Object.freeze({ list: Object.freeze([row]) });
  const first = toGraphqlView(input);
  assert.equal(first, toGraphqlView(input));
  assert.equal(first.list[0], toGraphqlView(row));
  assert.notEqual(first, input);
  assert.notEqual(first, toGraphqlView({ list: [row] }));
});

test('preserves opaque JSON values without inventing defaults', () => {
  assert.deepEqual(
    toGraphqlView({ amount: 0, enabled: false, metadata: { custom: 'value' } }),
    { amount: 0, enabled: false, metadata: { custom: 'value' } },
  );
});

test('does not reinterpret entity-like keys or nulls inside extensible JSON', () => {
  const extraData = { _id: null, metadata: { deletedAt: null } };
  const input = { _id: 'tr-1', extraData };
  const view = toGraphqlView(input);
  assert.equal(view.extraData, extraData);
  assert.deepEqual(view.extraData, {
    _id: null,
    metadata: { deletedAt: null },
  });
});

test('date output handles nullable and invalid dates', () => {
  assert.equal(formatDate(null, 'yyyy-MM-dd'), '-');
  assert.equal(formatDate('invalid', 'yyyy-MM-dd'), '-');
  assert.equal(formatDate('2026-10-09', 'yyyy-MM-dd'), '2026-10-09');
});
