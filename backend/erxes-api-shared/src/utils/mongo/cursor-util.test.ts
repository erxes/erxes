import { Types } from 'mongoose';
import { attachCursors, decodeCursor, encodeCursor } from './cursor-util';

describe('cursor-util', () => {
  describe('attachCursors', () => {
    it('gives every item an opaque cursor', () => {
      const list = [
        { _id: 'a', createdAt: '2026-01-01' },
        { _id: 'b', createdAt: '2026-01-02' },
      ];

      const result = attachCursors(list, ['createdAt']);

      expect(result).toHaveLength(2);
      for (const item of result) {
        expect(typeof item.cursor).toBe('string');
        expect(item.cursor).not.toHaveLength(0);
      }
    });

    it('produces a cursor the server can decode back to the same row', () => {
      const _id = new Types.ObjectId();
      const [item] = attachCursors([{ _id, createdAt: '2026-01-01' }], [
        'createdAt',
      ]);

      const decoded = decodeCursor(item.cursor);

      expect(decoded._id.toString()).toBe(_id.toString());
      expect(decoded.createdAt).toBe('2026-01-01');
    });

    it('matches encodeCursor, so a row cursor is a valid pagination cursor', () => {
      const list = [{ _id: 'a', createdAt: '2026-01-01' }];

      const [item] = attachCursors(list, ['createdAt']);

      expect(item.cursor).toBe(encodeCursor(list[0], ['createdAt']));
    });

    it('gives each row a distinct cursor', () => {
      const list = [{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }];

      const cursors = attachCursors(list, []).map((item) => item.cursor);

      expect(new Set(cursors).size).toBe(3);
    });

    it('preserves the original fields', () => {
      const [item] = attachCursors([{ _id: 'a', firstName: 'Ada' }], []);

      expect(item._id).toBe('a');
      expect(item.firstName).toBe('Ada');
    });

    it('handles an empty page', () => {
      expect(attachCursors([], ['createdAt'])).toEqual([]);
    });
  });

  describe('decodeCursor', () => {
    it('rejects a raw row id, which is what poisoned the record table', () => {
      expect(() => decodeCursor('68a1f4c2e9b1a20012345678')).toThrow(
        'Invalid cursor format',
      );
    });

    it('rejects a non-base64 leftover value', () => {
      expect(() => decodeCursor('not-a-cursor')).toThrow(
        'Invalid cursor format',
      );
    });
  });
});
