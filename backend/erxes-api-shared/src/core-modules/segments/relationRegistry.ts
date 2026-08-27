import { getPlugin, getPlugins } from '../../utils';
import { SegmentRelationMeta } from './fieldMeta';
import { ISegmentContentType } from './types';

/**
 * The relations declared across every running plugin.
 *
 * Read from service discovery rather than a registry of its own: a plugin
 * already publishes its relations as plain data, so a relation appears the
 * moment its plugin is enabled and disappears when it is not.
 */

export type SegmentRelationDirectory = {
  /** Relation key -> the plugin that can measure it. */
  owners: Map<string, string>;
  /** Relation key -> its declaration, which says how the two ends are joined. */
  relations: Map<string, SegmentRelationMeta>;
};

/** Every relation reachable from `subjectType`, and who owns each one. */
export const gatherSegmentRelations = async (
  subjectType: string,
): Promise<SegmentRelationDirectory> => {
  const owners = new Map<string, string>();
  const relations = new Map<string, SegmentRelationMeta>();

  for (const pluginName of await getPlugins()) {
    const plugin = await getPlugin(pluginName);
    const declared: SegmentRelationMeta[] =
      plugin.config?.meta?.segments?.segmentRelations || [];

    for (const relation of declared) {
      if (relation.subjectType === subjectType) {
        owners.set(relation.key, pluginName);
        relations.set(relation.key, relation);
      }
    }
  }

  return { owners, relations };
};

/**
 * Event content type -> the segment content types its records back.
 *
 * One collection can back more than one - a change to `core:contacts.customers`
 * moves both customer and lead segments - so this is a one-to-many map, built
 * from what each plugin declares rather than from the shape of the strings.
 */
export const gatherSegmentEventTypes = async (): Promise<
  Map<string, string[]>
> => {
  const byEventType = new Map<string, string[]>();

  for (const pluginName of await getPlugins()) {
    const plugin = await getPlugin(pluginName);
    const declared: ISegmentContentType[] =
      plugin.config?.meta?.segments?.contentTypes || [];

    for (const entry of declared) {
      if (!entry.contentType) {
        continue;
      }

      // Almost always its own name: the segment type and the event the
      // dispatcher emits are the same string. Only a type sharing a collection
      // with another - a lead among customers - has to say otherwise.
      for (const eventType of entry.eventTypes || [entry.contentType]) {
        byEventType.set(eventType, [
          ...(byEventType.get(eventType) || []),
          entry.contentType,
        ]);
      }
    }
  }

  return byEventType;
};
