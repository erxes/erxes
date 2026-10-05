import { buildErkhetProductDocForTest } from '../erkhetReferenceMigration';
import { buildErkhetContactQueryForTest } from '../erkhetMigration';

describe('Erkhet product reference migration', () => {
  it('matches vendor companies by their source brand name', () => {
    expect(
      buildErkhetContactQueryForTest({
        type: 'company',
        code: 'VENDOR-001',
        name: 'Vendor company',
        phone: '99112233',
        email: 'vendor@example.com',
      }),
    ).toEqual({
      $or: [
        { code: 'VENDOR-001' },
        { primaryName: 'Vendor company' },
        { names: { $in: ['Vendor company'] } },
      ],
    });
  });

  it('preserves deleted status and resolved vendor/custom property values', () => {
    expect(
      buildErkhetProductDocForTest({
        product: {
          code: ' INV_*001 ',
          name: 'Deleted inventory',
          status: 'deleted',
          vendor: 'Vendor company',
          customFieldsData: [
            {
              field: 'group-property-id',
              value: 'Retail',
              stringValue: 'Retail',
            },
          ],
        },
        categoryId: 'category-id',
        vendorId: 'vendor-company-id',
      }),
    ).toEqual(
      expect.objectContaining({
        code: 'INV001',
        status: 'deleted',
        vendorId: 'vendor-company-id',
        customFieldsData: [
          {
            field: 'group-property-id',
            value: 'Retail',
            stringValue: 'Retail',
          },
        ],
      }),
    );
  });
});
