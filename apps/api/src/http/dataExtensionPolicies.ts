import { MEMBER, needs } from './policyRules';

/**
 * Data Extensions in the access map (`./policies`): members shape objects and fields with
 * properties.manage and work custom records with the objects.* rights; plugins read and write
 * the values of their own record types.
 */
export const DATA_EXTENSION_ACCESS = {
  'recordTypes.list': MEMBER,

  'dataObjects.list': MEMBER,
  'dataObjects.get': MEMBER,
  'dataObjects.create': needs('properties.manage'),
  'dataObjects.update': needs('properties.manage'),
  'dataObjects.archive': needs('properties.manage'),
  'dataObjects.restore': needs('properties.manage'),
  'dataObjects.remove': needs('properties.manage'),

  'dataPlugins.list': MEMBER,
  'dataPlugins.connect': needs('properties.manage'),
  'dataPlugins.disconnect': needs('properties.manage'),

  // Plugins read the fields of their own record types, whose values they show (the service checks).
  'dataFields.list': { member: 'any', plugin: 'installed' },
  'dataFields.create': needs('properties.manage'),
  'dataFields.relate': needs('properties.manage'),
  'dataFields.update': needs('properties.manage'),
  'dataFields.preview': needs('properties.manage'),
  'dataFields.reorder': needs('properties.manage'),
  'dataFields.archive': needs('properties.manage'),
  'dataFields.restore': needs('properties.manage'),
  'dataFields.remove': needs('properties.manage'),

  'dataRecords.list': needs('objects.view'),
  'dataRecords.get': needs('objects.view'),
  'dataRecords.create': needs('objects.edit'),
  'dataRecords.update': needs('objects.edit'),
  'dataRecords.remove': needs('objects.delete'),
  'dataRecords.restore': needs('objects.delete'),

  // Values and history follow their record type's own rights; a plugin reaches only its own
  // records (the services check).
  'dataValues.get': { member: 'any', plugin: 'installed' },
  'dataValues.lookup': { member: 'any', plugin: 'installed' },
  'dataValues.update': { member: 'any', plugin: 'installed' },
  'dataChanges.history': { member: 'any', plugin: 'installed' },
  'dataChanges.convert': needs('properties.manage'),
  'dataChanges.remove': { plugin: 'installed' },
} as const;
