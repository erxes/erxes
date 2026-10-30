import { getTransactionNumbers } from '../getTransactionNumbers';

test('adjustment rows resolve their transaction ids to document numbers, never to the id itself', () => {
  const numbers = getTransactionNumbers([
    { _id: 'tr-gain', number: 'ADJ-0007', ptrNumber: 'PTR-1' },
    { _id: 'tr-loss', number: '', ptrNumber: 'PTR-2' },
    { _id: 'tr-draft', number: '', ptrNumber: '' },
    { _id: undefined, number: 'ORPHAN', ptrNumber: '' },
  ]);

  expect(numbers.get('tr-gain')).toBe('ADJ-0007');
  expect(numbers.get('tr-loss')).toBe('PTR-2');
  expect(numbers.get('tr-draft')).toBe('');
  expect(numbers.get('tr-deleted')).toBeUndefined();
  expect([...numbers.values()]).not.toContain('ORPHAN');
});
