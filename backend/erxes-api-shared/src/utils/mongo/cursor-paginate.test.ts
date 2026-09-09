import type { Model, PipelineStage } from 'mongoose';
import { cursorPaginate, cursorPaginateAggregation } from './mongoose-utils';
import { decodeCursor } from './cursor-util';

interface MockItem {
  _id: string;
  name: string;
  createdAt: Date;
}

type MockItemWithCursor = MockItem & { cursor: string };

describe('cursorPaginate per-row cursor generation', () => {
  const mockItems: MockItem[] = [
    { _id: 'item1', name: 'First Item', createdAt: new Date('2026-01-01') },
    { _id: 'item2', name: 'Second Item', createdAt: new Date('2026-01-02') },
    { _id: 'item3', name: 'Third Item', createdAt: new Date('2026-01-03') },
  ];

  const createMockModel = (items: MockItem[] = mockItems): unknown => ({
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([...items]),
        }),
      }),
    }),
    countDocuments: jest.fn().mockResolvedValue(items.length),
  });

  const createMockAggregationModel = (items: MockItem[] = mockItems): unknown => ({
    aggregate: jest.fn().mockImplementation((pipeline: PipelineStage[]) => {
      if (pipeline.some((stage) => '$count' in stage)) {
        return Promise.resolve([{ totalCount: items.length }]);
      }
      return Promise.resolve([...items]);
    }),
  });

  test('cursorPaginate attaches an opaque cursor to every returned item in list', async () => {
    const mockModel = createMockModel();
    const result = await cursorPaginate<MockItem>({
      model: mockModel as Model<MockItem>,
      params: { limit: 10, orderBy: { createdAt: 1 } },
    });

    expect(result.list).toHaveLength(3);

    result.list.forEach((item, index) => {
      const withCursor = item as MockItemWithCursor;
      expect(withCursor).toHaveProperty('cursor');
      expect(typeof withCursor.cursor).toBe('string');
      expect(withCursor.cursor.length).toBeGreaterThan(0);

      // Decoding the cursor should yield the item's _id and sort field
      const decoded = decodeCursor(withCursor.cursor);
      expect(decoded._id).toBe(mockItems[index]._id);
      expect(decoded.createdAt).toBe(mockItems[index].createdAt.toISOString());
    });

    // startCursor and endCursor should match first and last item cursors
    const first = result.list[0] as MockItemWithCursor;
    const last = result.list[result.list.length - 1] as MockItemWithCursor;
    expect(result.pageInfo.startCursor).toBe(first.cursor);
    expect(result.pageInfo.endCursor).toBe(last.cursor);
  });

  test('cursorPaginate handles empty results gracefully', async () => {
    const mockModel = createMockModel([]);
    const result = await cursorPaginate<MockItem>({
      model: mockModel as Model<MockItem>,
      params: { limit: 10 },
    });

    expect(result.list).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.pageInfo.startCursor).toBeNull();
    expect(result.pageInfo.endCursor).toBeNull();
  });

  test('cursorPaginateAggregation attaches an opaque cursor to every returned item in list', async () => {
    const mockModel = createMockAggregationModel();
    const result = await cursorPaginateAggregation<MockItem>({
      model: mockModel as Model<MockItem>,
      params: { limit: 10, orderBy: { name: 1 } },
    });

    expect(result.list).toHaveLength(3);

    result.list.forEach((item, index) => {
      const withCursor = item as MockItemWithCursor;
      expect(withCursor).toHaveProperty('cursor');
      expect(typeof withCursor.cursor).toBe('string');

      const decoded = decodeCursor(withCursor.cursor);
      expect(decoded._id).toBe(mockItems[index]._id);
      expect(decoded.name).toBe(mockItems[index].name);
    });

    const first = result.list[0] as MockItemWithCursor;
    const last = result.list[result.list.length - 1] as MockItemWithCursor;
    expect(result.pageInfo.startCursor).toBe(first.cursor);
    expect(result.pageInfo.endCursor).toBe(last.cursor);
  });
});
