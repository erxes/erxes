import { sanitizeFilename, sanitizeKey } from '../sanitize';

describe('uploaded file keys', () => {
  it.each([
    'CleanShot 2026-09-16 at 19.35.24@2x.png',
    '#aesthetic #grunge.jpeg',
    'Монгол зураг.png',
  ])('accepts the stored key for %s', (filename) => {
    const key = `uploads/id-${sanitizeFilename(filename)}`;
    expect(sanitizeKey(key)).toBe(key);
  });

  it.each([
    '',
    '../image.png',
    'uploads/../../image.png',
    'https://example.com/image.png',
    'uploads/image?key.png',
    'uploads/image\u0000.png',
    'uploads\\image.png',
  ])('rejects unsafe key %j', (key) => {
    expect(() => sanitizeKey(key)).toThrow();
  });
});
