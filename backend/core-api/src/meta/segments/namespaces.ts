import { SegmentFieldNamespace } from 'erxes-api-shared/core-modules';

const CONTACT_NAMESPACES: SegmentFieldNamespace[] = [
  {
    prefix: 'propertiesData',
    label: 'Custom properties',
    path: 'propertiesData',
  },
];

export const CORE_SEGMENT_FIELD_NAMESPACES: Record<
  string,
  SegmentFieldNamespace[]
> = {
  'core:contacts.customers': CONTACT_NAMESPACES,
  'core:contacts.leads': CONTACT_NAMESPACES,
  'core:contacts.companies': CONTACT_NAMESPACES,
  'core:products.products': [
    {
      prefix: 'propertiesData',
      label: 'Custom properties',
      path: 'propertiesData',
    },
  ],
};
