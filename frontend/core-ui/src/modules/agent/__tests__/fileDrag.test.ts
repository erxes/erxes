import { dragFileCount, isExternalFileDrag } from '../utils/fileDrag';

describe('isExternalFileDrag', () => {
  it('accepts only file drags that started outside the page', () => {
    expect(isExternalFileDrag({ types: ['Files'] }, false)).toBe(true);
    expect(isExternalFileDrag({ types: ['text/plain'] }, false)).toBe(false);
    expect(
      isExternalFileDrag({ types: ['text/uri-list', 'text/html'] }, false),
    ).toBe(false);
    expect(isExternalFileDrag({ types: ['Files', 'text/html'] }, true)).toBe(
      false,
    );
    expect(isExternalFileDrag(null, false)).toBe(false);
  });
});

describe('dragFileCount', () => {
  const items = (...kinds: string[]) =>
    ({ items: kinds.map((kind) => ({ kind })) }) as unknown as Pick<
      DataTransfer,
      'items'
    >;

  it('counts file items and hides unknown counts', () => {
    expect(dragFileCount(items('file', 'file', 'string'))).toBe(2);
    expect(dragFileCount(items())).toBeUndefined();
    expect(dragFileCount(null)).toBeUndefined();
  });
});
