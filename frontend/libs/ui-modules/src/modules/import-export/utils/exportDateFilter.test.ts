import assert from 'node:assert/strict';
import test from 'node:test';
import { getLocalDayExportBounds } from './exportDateFilter';

test('less than excludes the selected local calendar day', () => {
  const selected = new Date(2026, 8, 10);
  assert.deepEqual(getLocalDayExportBounds(selected, 'lessThan'), {
    to: selected.toISOString(),
  });
});

test('greater than starts at the next local calendar day across DST', () => {
  const selected = new Date(2026, 2, 29);
  const nextDay = new Date(2026, 2, 30);
  const bounds = getLocalDayExportBounds(selected, 'greaterThan');

  assert.equal(bounds.from, nextDay.toISOString());
  assert.equal(
    new Date(bounds.from as string).getDate(),
    selected.getDate() + 1,
  );
});
