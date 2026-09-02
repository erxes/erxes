import {
  dateField,
  lookupField,
  numberField,
  SegmentFieldMeta,
  staticField,
  textField,
} from 'erxes-api-shared/core-modules';
import { PRODUCT_STATUSES, PRODUCT_TYPES } from '~/modules/products/constants';

export const PRODUCT_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  textField({ key: 'name', label: 'Name' }),
  textField({ key: 'shortName', label: 'Short name' }),
  textField({ key: 'code', label: 'Code' }),
  textField({ key: 'description', label: 'Description' }),
  textField({ key: 'barcodes', label: 'Barcodes' }),

  staticField({ key: 'type', label: 'Type', options: PRODUCT_TYPES.ALL }),
  staticField({
    key: 'status',
    label: 'Status',
    options: PRODUCT_STATUSES.ALL,
  }),

  numberField({ key: 'unitPrice', label: 'Unit price' }),

  textField({ key: 'currency', label: 'Currency' }),
  textField({ key: 'uom', label: 'Unit of measure' }),

  textField({ key: 'categoryId', label: 'Category' }),
  textField({ key: 'vendorId', label: 'Vendor' }),
  textField({ key: 'scopeBrandIds', label: 'Brands' }),

  lookupField({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),

  dateField({ key: 'createdAt', label: 'Created at' }),
];
