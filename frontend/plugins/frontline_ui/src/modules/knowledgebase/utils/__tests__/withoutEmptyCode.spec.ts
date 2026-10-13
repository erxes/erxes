import { withoutEmptyCode } from '../withoutEmptyCode';

describe('withoutEmptyCode', () => {
  it.each([[''], ['   '], [undefined]])(
    'drops an empty code (%p) so the sparse unique index ignores it',
    (code) => {
      expect(withoutEmptyCode({ title: 'A', code }).code).toBeUndefined();
    },
  );

  it('keeps a real code, trimmed', () => {
    expect(withoutEmptyCode({ title: 'A', code: ' FAQ-1 ' }).code).toBe(
      'FAQ-1',
    );
  });

  it('leaves the other fields untouched', () => {
    expect(withoutEmptyCode({ title: 'A', icon: 'book', code: '' })).toEqual({
      title: 'A',
      icon: 'book',
      code: undefined,
    });
  });
});
