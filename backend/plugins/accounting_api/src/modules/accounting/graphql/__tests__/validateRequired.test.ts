import { validateRequiredId, validateRequiredIds } from '../validateRequired';

describe('required GraphQL identifiers', () => {
  it.each([undefined, null, '', '  ', 1, {}])(
    'rejects an invalid single id: %p',
    (value) => {
      expect(() => validateRequiredId(value)).toThrow('_id must not be empty');
    },
  );

  it.each([undefined, null, [], [''], ['valid', '  '], [1], 'valid'])(
    'rejects invalid id lists: %p',
    (value) => {
      expect(() => validateRequiredIds(value, 'ids')).toThrow();
    },
  );

  it('accepts complete identifiers without rewriting them', () => {
    const ids = ['id-1', 'id-2'];
    expect(() => validateRequiredId(ids[0])).not.toThrow();
    expect(() => validateRequiredIds(ids, 'ids')).not.toThrow();
    expect(ids).toEqual(['id-1', 'id-2']);
  });
});
