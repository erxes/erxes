import { IStructurePluginCapability } from 'erxes-api-shared/core-types';

export const STRUCTURE_ENTITY_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export const ORGANIZATION_TYPE_CODE = 'organization';

export const STRUCTURE_PERMISSION_MODULE = {
  plugin: 'core',
  module: 'organization',
} as const;

export const STRUCTURE_READ_ACTION = 'structuresRead';

export const STRUCTURE_PROPERTIES_CONTENT_TYPE = 'core:structureEntity';

export const STRUCTURE_CAPABILITIES = {
  LOCATION: 'location',
  CONTACT: 'contact',
  SCHEDULE: 'schedule',
  STOCK_PLACE: 'stockPlace',
} as const;

export const CORE_STRUCTURE_CAPABILITIES: IStructurePluginCapability[] = [
  {
    key: STRUCTURE_CAPABILITIES.LOCATION,
    label: 'Location',
    description: 'Address, coordinate and radius',
  },
  {
    key: STRUCTURE_CAPABILITIES.CONTACT,
    label: 'Contact',
    description: 'Phone, email, links and image',
  },
  {
    key: STRUCTURE_CAPABILITIES.SCHEDULE,
    label: 'Schedule',
    description: 'Work hours and holidays',
  },
  {
    key: STRUCTURE_CAPABILITIES.STOCK_PLACE,
    label: 'Stock place',
    description: 'Can hold inventory',
  },
];

export const STRUCTURE_SEAT_COVERAGES = {
  NODE: 'node',
  BELOW: 'below',
  SELECTED: 'selected',
} as const;

export const STRUCTURE_NOTIFICATION_TYPE = 'structureAssignment';

export const STRUCTURE_SEAT_NOTIFICATION_TYPE = 'structureSeatAssignment';
