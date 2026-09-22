import { SegmentRelationMeta } from './relationRegistry';

const plugins: Record<string, SegmentRelationMeta[]> = {
  sales: [
    {
      key: 'customer.deals',
      label: 'Deals',
      subjectType: 'core:contacts.customers',
      relatedType: 'sales:sales.deals',
      join: {
        via: 'relation',
        subjectRecordType: 'core:customer',
        relatedRecordType: 'sales:deal',
      },
    },
    {
      key: 'company.deals',
      label: 'Deals',
      subjectType: 'core:contacts.companies',
      relatedType: 'sales:sales.deals',
      join: {
        via: 'relation',
        subjectRecordType: 'core:company',
        relatedRecordType: 'sales:deal',
      },
    },
    {
      key: 'deal.products',
      label: 'Products',
      subjectType: 'sales:sales.deals',
      relatedType: 'core:products.products',
      join: { via: 'field', path: 'productsData.productId' },
    },
  ],
};

jest.mock('../../utils', () => ({
  getPlugins: async () => Object.keys(plugins),
  getPlugin: async (name: string) => ({
    config: { meta: { segments: { segmentRelations: plugins[name] } } },
  }),
}));

import { gatherSegmentRecordTypes } from './relationRegistry';

describe('gatherSegmentRecordTypes', () => {
  it('maps both ends of a relation back to the types segments use', async () => {
    const map = await gatherSegmentRecordTypes();

    expect(map.get('core:customer')).toEqual(['core:contacts.customers']);
    expect(map.get('core:company')).toEqual(['core:contacts.companies']);
    expect(map.get('sales:deal')).toEqual(['sales:sales.deals']);
  });

  it('ignores a relation joined by a field, which stores no row', async () => {
    const map = await gatherSegmentRecordTypes();

    expect([...map.keys()].sort()).toEqual([
      'core:company',
      'core:customer',
      'sales:deal',
    ]);
  });
});
