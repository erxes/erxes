import { cursorPaginate, cursorPaginateAggregation } from './mongoose-utils';
import { decodeCursor } from './cursor-util';

describe('cursorPaginate per-row cursor generation', () => {
  const mockItems = [
    { _id: 'item1', name: 'First Item', createdAt: new Date('2026-01-01') },
    { _id: 'item2', name: 'Second Item', createdAt: new Date('2026-01-02') },
    { _id: 'item3', name: 'Third Item', createdAt: new Date('2026-01-03') },
  ];

  const createMockModel = (items = mockItems) => ({
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([...items]),
        }),
      }),
    }),
    countDocuments: jest.fn().mockResolvedValue(items.length),
  });

  const createMockAggregationModel = (items = mockItems) => ({
    aggregate: jest.fn().mockImplementation((pipeline: any[]) => {
      // If it's a count pipeline
      if (pipeline.some((stage) => stage.$count)) {
        return Promise.resolve([{ totalCount: items.length }]);
      }
      return Promise.resolve([...items]);
    }),
  });

  test('cursorPaginate attaches an opaque cursor to every returned item in list', async () => {
    const mockModel = createMockModel();
    const result = await cursorPaginate<any>({
      model: mockModel as any,
      params: { limit: 10, orderBy: { createdAt: 1 } },
    });

    expect(result.list).toHaveLength(3);

    result.list.forEach((item: any, index: number) => {
      expect(item).toHaveProperty('cursor');
      expect(typeof item.cursor).toBe('string');
      expect(item.cursor.length).toBeGreaterThan(0);

      // Decoding the cursor should yield the item's _id and sort field
      const decoded = decodeCursor(item.cursor);
      expect(decoded._id).toBe(mockItems[index]._id);
      expect(decoded.createdAt).toBe(mockItems[index].createdAt.toISOString());
    });

    // startCursor and endCursor should match first and last item cursors
    expect(result.pageInfo.startCursor).toBe((result.list[0] as any).cursor);
    expect(result.pageInfo.endCursor).toBe(
      (result.list[result.list.length - 1] as any).cursor,
    );
  });

  test('cursorPaginate handles empty results gracefully', async () => {
    const mockModel = createMockModel([]);
    const result = await cursorPaginate<any>({
      model: mockModel as any,
      params: { limit: 10 },
    });

    expect(result.list).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.pageInfo.startCursor).toBeNull();
    expect(result.pageInfo.endCursor).toBeNull();
  });

  test('cursorPaginateAggregation attaches an opaque cursor to every returned item in list', async () => {
    const mockModel = createMockAggregationModel();
    const result = await cursorPaginateAggregation<any>({
      model: mockModel as any,
      params: { limit: 10, orderBy: { name: 1 } },
    });

    expect(result.list).toHaveLength(3);

    result.list.forEach((item: any, index: number) => {
      expect(item).toHaveProperty('cursor');
      expect(typeof item.cursor).toBe('string');

      const decoded = decodeCursor(item.cursor);
      expect(decoded._id).toBe(mockItems[index]._id);
      expect(decoded.name).toBe(mockItems[index].name);
    });

    expect(result.pageInfo.startCursor).toBe((result.list[0] as any).cursor);
    expect(result.pageInfo.endCursor).toBe(
      (result.list[result.list.length - 1] as any).cursor,
    );
  });
});
