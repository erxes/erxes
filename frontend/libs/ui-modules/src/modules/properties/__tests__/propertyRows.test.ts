import type { IPropertyRow } from '../types/fieldsTypes';
import { getPropertyRowsUpdate } from '../propertyUtils';

const original = {
  'g:edited': [{ _id: 'a', value: 'old' }],
  'g:other': [{ _id: 'b', value: 'newer' }],
  unrelated: 'keep',
};

it.each<[string, IPropertyRow[]]>([
  ['add', [{ _id: 'a', value: 'old' }, { _id: 'c' }]],
  ['remove', []],
  ['reorder', [{ _id: 'c' }, { _id: 'a', value: 'old' }]],
])('patches only the edited group when rows %s', (_action, rows) => {
  expect(getPropertyRowsUpdate(original, 'g:edited', rows, 'patch')).toEqual({
    'g:edited': rows,
  });
  expect(original.unrelated).toBe('keep');
});

it('preserves replacement semantics for existing consumers', () => {
  expect(getPropertyRowsUpdate(original, 'g:edited', [])).toEqual({
    'g:edited': [],
    'g:other': [{ _id: 'b', value: 'newer' }],
    unrelated: 'keep',
  });
});
