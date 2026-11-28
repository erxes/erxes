import { PluginRecordType } from '@erxes/core-contract';
import type { TPanelRecordType, TRecordDataFields } from 'erxes-ui';
import type { LoadedPlugin } from './types';

/** A plugin record type with Data Extensions fields it keeps the values of. */
export interface PluginDataFieldsType {
  /** The plugin's `name`, for its words and its settings link. */
  plugin: string;
  /** The record type its fields are defined on, `<plugin>.<type>`. */
  type: PluginRecordType;
  /** The record type's `title` ("Task"), in the plugin's words. */
  title: string;
  dataFields: TRecordDataFields;
}

/** The record type's `dataFields` with the type parsed, or null when it has none. */
export const dataFieldsOf = (plugin: string, recordType: TPanelRecordType) => {
  const { dataFields } = recordType;
  const type = PluginRecordType.safeParse(dataFields?.type);

  return dataFields && type.success
    ? { plugin, type: type.data, title: recordType.title, dataFields }
    : null;
};

/** Every record type with `dataFields` among `plugins`, in their configs' order. */
export const pluginDataFieldsTypes = (plugins: LoadedPlugin[]): PluginDataFieldsType[] =>
  plugins.flatMap(({ config }) =>
    config.recordTypes.flatMap((recordType) => dataFieldsOf(config.name, recordType) ?? []),
  );
