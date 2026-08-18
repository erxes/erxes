import { isValidCursor } from './cursorUtils';

const encodeCursor = (data: Record<string, unknown>) =>
  btoa(JSON.stringify(data));

describe('isValidCursor', () => {
  it('accepts an opaque cursor produced by the server', () => {
    expect(isValidCursor(encodeCursor({ _id: '68a1f4c2e9b1a20012345678' }))).toBe(
      true,
    );
  });

  it('accepts a cursor carrying sort fields alongside _id', () => {
    const cursor = encodeCursor({
      createdAt: '2026-01-01T00:00:00.000Z',
      _id: '68a1f4c2e9b1a20012345678',
    });

    expect(isValidCursor(cursor)).toBe(true);
  });

  it('rejects a raw row id, the value that poisoned the record table', () => {
    expect(isValidCursor('68a1f4c2e9b1a20012345678')).toBe(false);
  });

  it('rejects an empty string written from a row with no cursor', () => {
    expect(isValidCursor('')).toBe(false);
  });

  it('rejects a missing value', () => {
    expect(isValidCursor(null)).toBe(false);
  });

  it('rejects base64 that does not decode to JSON', () => {
    expect(isValidCursor(btoa('not json'))).toBe(false);
  });

  it('rejects base64 JSON without an _id', () => {
    expect(isValidCursor(encodeCursor({ createdAt: '2026-01-01' }))).toBe(false);
  });

  it('rejects base64 JSON that is not an object', () => {
    expect(isValidCursor(btoa(JSON.stringify('a string')))).toBe(false);
    expect(isValidCursor(btoa(JSON.stringify(null)))).toBe(false);
  });
});
