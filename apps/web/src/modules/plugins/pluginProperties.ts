import { PluginRecordType } from '@erxes/core-contract';
import type { TPanelRecordType, TRecordProperties } from 'erxes-ui';
import type { LoadedPlugin } from './types';

/** A plugin record type with custom fields, as core's settings and panel list them. */
export interface PluginPropertyType {
  /** The plugin's `name`, for its words and its settings link. */
  plugin: string;
  /** The record type its fields are defined on, `<plugin>.<type>`. */
  type: PluginRecordType;
  /** The record type's `title` ("Task"), in the plugin's words. */
  title: string;
  properties: TRecordProperties;
}

/** The record type's properties with the type parsed, or null when it has none. */
export const propertiesOf = (plugin: string, recordType: TPanelRecordType) => {
  const { properties } = recordType;
  const type = PluginRecordType.safeParse(properties?.type);

  return properties && type.success
    ? { plugin, type: type.data, title: recordType.title, properties }
    : null;
};

/** Every record type with custom fields among `plugins`, in their configs' order. */
export const pluginPropertyTypes = (plugins: LoadedPlugin[]): PluginPropertyType[] =>
  plugins.flatMap(({ config }) =>
    config.recordTypes.flatMap((recordType) => propertiesOf(config.name, recordType) ?? []),
  );
