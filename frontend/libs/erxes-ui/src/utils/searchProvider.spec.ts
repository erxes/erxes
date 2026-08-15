import { readCursorList } from './searchProvider';

describe('readCursorList', () => {
  it('reads nodes, total count, and the forward cursor', () => {
    expect(
      readCursorList<{ _id: string }>(
        {
          results: {
            list: [{ _id: 'one' }],
            totalCount: 2,
            pageInfo: {
              hasNextPage: true,
              endCursor: 'cursor-one',
            },
          },
        },
        'results',
      ),
    ).toEqual({
      nodes: [{ _id: 'one' }],
      totalCount: 2,
      pageInfo: {
        hasNextPage: true,
        endCursor: 'cursor-one',
      },
    });
  });

  it('returns a closed page for missing or malformed payloads', () => {
    expect(readCursorList({}, 'results')).toEqual({
      nodes: [],
      totalCount: 0,
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
    });
  });
});
