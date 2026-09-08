import { SegmentField, SegmentFieldMeta } from 'erxes-api-shared/core-modules';
import { PRODUCT_STATUSES, PRODUCT_TYPES } from '~/modules/products/constants';

export const PRODUCT_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  SegmentField.text({ key: 'name', label: 'Name' }),
  SegmentField.text({ key: 'shortName', label: 'Short name' }),
  SegmentField.text({ key: 'code', label: 'Code' }),
  SegmentField.text({ key: 'description', label: 'Description' }),
  SegmentField.text({ key: 'barcodes', label: 'Barcodes' }),

  SegmentField.static({
    key: 'type',
    label: 'Type',
    options: PRODUCT_TYPES.ALL,
  }),
  SegmentField.static({
    key: 'status',
    label: 'Status',
    options: PRODUCT_STATUSES.ALL,
  }),

  SegmentField.number({ key: 'unitPrice', label: 'Unit price' }),

  SegmentField.text({ key: 'currency', label: 'Currency' }),
  SegmentField.text({ key: 'uom', label: 'Unit of measure' }),

  SegmentField.text({ key: 'categoryId', label: 'Category' }),
  SegmentField.text({ key: 'vendorId', label: 'Vendor' }),
  SegmentField.text({ key: 'scopeBrandIds', label: 'Brands' }),

  SegmentField.lookup({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),

  SegmentField.date({ key: 'createdAt', label: 'Created at' }),
];
