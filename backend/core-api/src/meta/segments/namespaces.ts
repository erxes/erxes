import { SegmentFieldNamespace } from 'erxes-api-shared/core-modules';

const propertiesOf = (propertyType: string): SegmentFieldNamespace[] => [
  {
    prefix: 'propertiesData',
    label: 'Custom properties',
    path: 'propertiesData',
    propertyType,
  },
];

export const CORE_SEGMENT_FIELD_NAMESPACES: Record<
  string,
  SegmentFieldNamespace[]
> = {
  'core:contacts.customers': propertiesOf('core:customer'),
  'core:contacts.leads': propertiesOf('core:customer'),
  'core:contacts.companies': propertiesOf('core:company'),
  'core:products.products': propertiesOf('core:product'),
  'core:organization.users': propertiesOf('core:user'),
};
