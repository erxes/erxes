import { posOrderRecordsQuery } from '@/pos/graphql/resolvers/queries/orders';
import { getPosItemsExportData } from '../getPosItemsExportData';

jest.mock('@/pos/graphql/resolvers/queries/orders', () => ({
  posOrderRecordsQuery: jest.fn(),
}));

const recordsQuery = jest.mocked(posOrderRecordsQuery);

const context = {
  subdomain: 'test',
  processId: 'process-1',
  models: {} as never,
};

const exportData = (extra: { cursor?: string; ids?: string[] } = {}) => ({
  moduleName: 'pos',
  collectionName: 'posItems',
  limit: 5000,
  filters: { posId: 'pos-1' },
  selectedFields: ['number', 'productCode'],
  ...extra,
});

describe('getPosItemsExportData', () => {
  beforeEach(() => {
    recordsQuery.mockReset();
  });

  it('refuses selected rows before querying', async () => {
    await expect(
      getPosItemsExportData(exportData({ ids: ['item-1'] }), context),
    ).rejects.toThrow('POS items export does not support selected rows');

    expect(recordsQuery).not.toHaveBeenCalled();
  });

  it('pages filtered items by the cursor offset', async () => {
    recordsQuery.mockResolvedValue([
      { number: 'A-1', items: { product: { code: 'P1' } } },
      { number: 'A-1', items: { product: { code: 'P2' } } },
    ]);

    const rows = await getPosItemsExportData(
      { subdomain: 'test', data: exportData({ cursor: '5000', ids: [] }) },
      context,
    );

    expect(recordsQuery).toHaveBeenCalledWith(context.models, 'test', {
      posId: 'pos-1',
      perPage: 5000,
      page: 2,
    });
    expect(rows).toEqual([
      { _id: '5001', number: 'A-1', productCode: 'P1' },
      { _id: '5002', number: 'A-1', productCode: 'P2' },
    ]);
  });
});
