import {
  dataExtensionSegmentNamespace,
  SegmentFieldNamespace,
} from 'erxes-api-shared/core-modules';

const propertiesOf = (
  propertyType: string,
  dataExtensionRecordType: string,
): SegmentFieldNamespace[] => [
  {
    prefix: 'propertiesData',
    label: 'Custom properties',
    path: 'propertiesData',
    propertyType,
  },
  dataExtensionSegmentNamespace(dataExtensionRecordType),
];

export const CORE_SEGMENT_FIELD_NAMESPACES: Record<
  string,
  SegmentFieldNamespace[]
> = {
  'core:contacts.customers': propertiesOf('core:customer', 'core:customer'),
  'core:contacts.leads': propertiesOf('core:customer', 'core:lead'),
  'core:contacts.companies': propertiesOf('core:company', 'core:company'),
  'core:products.products': propertiesOf('core:product', 'core:product'),
  'core:organization.users': propertiesOf('core:user', 'core:teamMember'),
};
