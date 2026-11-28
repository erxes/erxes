import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { dataExtensionsBase } from './dataExtensions';
import { ERRORS } from './errors';
import { RecordNativeField } from './recordTypes';
import { PluginName } from './values';

/** A record type of a plugin's manifest `objects`, as Data Extensions reads it. */
export const DataExtensionPluginObject = z.object({
  type: z.string(),
  label: z.string(),
  singularLabel: z.string(),
  icon: z.string().nullable(),
  /** The fields its records have of their own, which formulas and rollups read. */
  nativeFields: z.array(RecordNativeField),
  /**
   * Why its own fields can't be read ("sales_deal_fields has no number column amount"); null
   * when they can, or when it declares none.
   */
  problem: z.string().nullable(),
});

/** An installed plugin with `objects`, and whether it is connected to Data Extensions here. */
export const DataExtensionPlugin = z.object({
  plugin: PluginName,
  title: z.string(),
  objects: z.array(DataExtensionPluginObject),
  connected: z.boolean(),
  connectedAt: isoDate().nullable(),
  connectedBy: Id.nullable(),
  /** Active fields members added to its record types. */
  fieldCount: z.int(),
});

export type DataExtensionPlugin = z.infer<typeof DataExtensionPlugin>;

const base = dataExtensionsBase.errors({ PLUGIN_NOT_INSTALLED: ERRORS.PLUGIN_NOT_INSTALLED });

const PluginInput = z.object({ plugin: PluginName });

/**
 * Plugins connected to Data Extensions: a connected plugin's record types take fields, and its
 * records' own fields (read through its views) go into formulas and rollups. Connecting needs
 * `properties.manage`.
 */
export const dataPluginsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/data-plugins',
      summary: 'List plugins with extendable objects',
      description: 'Installed plugins whose manifests declare objects, connected or not, by title.',
    })
    .output(listOf(DataExtensionPlugin)),
  connect: base
    .route({
      method: 'POST',
      path: '/data-plugins/{plugin}/connect',
      summary: 'Connect a plugin',
      description:
        'Lets members add fields to the plugin’s objects. 400 PLUGIN_NOT_INSTALLED when it is not installed or declares no objects.',
    })
    .input(PluginInput)
    .output(DataExtensionPlugin),
  disconnect: base
    .route({
      method: 'POST',
      path: '/data-plugins/{plugin}/disconnect',
      summary: 'Disconnect a plugin',
      description:
        'Stops members adding fields to the plugin’s objects. 409 ARCHIVE_FIRST while its record types have active fields.',
    })
    .input(PluginInput)
    .output(DataExtensionPlugin),
};
