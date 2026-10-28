export const STRUCTURE_CAPABILITY = {
  location: 'location',
  contact: 'contact',
  schedule: 'schedule',
  stockPlace: 'stockPlace',
} as const;

export const STRUCTURE_LEGACY_KINDS = [
  'none',
  'branch',
  'department',
  'unit',
] as const;

export const STRUCTURE_PROPERTIES_CONTENT_TYPE = 'core:structureEntity';

export const STRUCTURE_SETTINGS_PATH = '/settings/structures';

export const STRUCTURE_MANAGE_ACTION = 'structureEntitiesManage';

export const STRUCTURE_TYPES_MANAGE_ACTION = 'structureEntityTypesManage';

export const STRUCTURE_READ_ACTION = 'structuresRead';

export const STRUCTURE_POSITIONS_MANAGE_ACTION = 'permissionsManage';
