import { SegmentFieldMeta } from 'erxes-api-shared/core-modules';
import { COMPANY_SEGMENT_FIELDS } from './company';
import { PRODUCT_SEGMENT_FIELDS } from './product';
import { CONTACT_SEGMENT_FIELDS } from './contact';
import { USER_SEGMENT_FIELDS } from './user';

export const CORE_SEGMENT_FIELDS: Record<string, SegmentFieldMeta[]> = {
  'core:contacts.customers': CONTACT_SEGMENT_FIELDS,
  'core:contacts.leads': CONTACT_SEGMENT_FIELDS,
  'core:contacts.companies': COMPANY_SEGMENT_FIELDS,
  'core:organization.users': USER_SEGMENT_FIELDS,
  'core:products.products': PRODUCT_SEGMENT_FIELDS,
};

export {
  COMPANY_SEGMENT_FIELDS,
  CONTACT_SEGMENT_FIELDS,
  PRODUCT_SEGMENT_FIELDS,
  USER_SEGMENT_FIELDS,
};
