import { SegmentFieldNamespace } from 'erxes-api-shared/core-modules';

/**
 * Key-value namespaces on core contacts.
 *
 * Custom property keys are tenant data, so they are declared once as a
 * namespace rather than enumerated - no plugin can know them at build time.
 */
const CONTACT_NAMESPACES: SegmentFieldNamespace[] = [
  {
    prefix: 'customFieldsData',
    label: 'Custom properties',
    path: 'customFieldsData',
    keyPath: 'field',
    valuePath: 'value',
  },
];

export const CORE_SEGMENT_FIELD_NAMESPACES: Record<
  string,
  SegmentFieldNamespace[]
> = {
  'core:contacts.customers': CONTACT_NAMESPACES,
  'core:contacts.leads': CONTACT_NAMESPACES,
  'core:contacts.companies': CONTACT_NAMESPACES,
};
