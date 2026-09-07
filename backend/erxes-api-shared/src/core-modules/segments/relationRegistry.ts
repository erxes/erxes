import { getPlugin, getPlugins } from '../../utils';
import { resolveSegmentFieldDependencies, SegmentFieldMeta } from './fieldMeta';
import { ISegmentContentType } from './types';

export type SegmentRelationMeta = {
  key: string;
  label: string;
  subjectType: string;
  relatedType: string;
  join:
    | {
        via: 'relation';
        subjectRecordType: string;
        relatedRecordType: string;
      }
    | { via: 'field'; on: 'subject' | 'related'; path: string };
};

export type SegmentRelationDirectory = {
  owners: Map<string, string>;
  relations: Map<string, SegmentRelationMeta>;
};

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

export const gatherSegmentRecordTypes = async (): Promise<
  Map<string, string[]>
> => {
  const bySegmentType = new Map<string, Set<string>>();

  const add = (recordType?: string, segmentType?: string) => {
    if (!recordType || !segmentType) {
      return;
    }

    bySegmentType.set(
      recordType,
      (bySegmentType.get(recordType) || new Set<string>()).add(segmentType),
    );
  };

  for (const pluginName of await getPlugins()) {
    const plugin = await getPlugin(pluginName);
    const declared: SegmentRelationMeta[] =
      plugin.config?.meta?.segments?.segmentRelations || [];

    for (const relation of declared) {
      if (relation.join.via !== 'relation') {
        continue;
      }

      add(relation.join.subjectRecordType, relation.subjectType);
      add(relation.join.relatedRecordType, relation.relatedType);
    }
  }

  return new Map(
    [...bySegmentType].map(([recordType, types]) => [recordType, [...types]]),
  );
};

export type SegmentFieldSourceLink = {
  subjectType: string;
  via: string;
};

export type SegmentFieldSourceDirectory = {
  byField: Map<string, string[]>;
  bySource: Map<string, SegmentFieldSourceLink[]>;
};

export const gatherSegmentFieldSources =
  async (): Promise<SegmentFieldSourceDirectory> => {
    const byField = new Map<string, string[]>();
    const bySource = new Map<string, SegmentFieldSourceLink[]>();

    for (const pluginName of await getPlugins()) {
      const plugin = await getPlugin(pluginName);
      const declared: Record<string, SegmentFieldMeta[]> =
        plugin.config?.meta?.segments?.segmentFields || {};

      for (const [contentType, fields] of Object.entries(declared)) {
        for (const field of fields) {
          for (const dependency of resolveSegmentFieldDependencies(field)) {
            if (!dependency.contentType) {
              continue;
            }

            const key = `${contentType}:${field.key}`;

            byField.set(key, [
              ...(byField.get(key) || []),
              dependency.contentType,
            ]);

            if (!dependency.via) {
              continue;
            }

            const reached = bySource.get(dependency.contentType) || [];

            const already = reached.some(
              (link) =>
                link.subjectType === contentType && link.via === dependency.via,
            );

            if (!already) {
              bySource.set(dependency.contentType, [
                ...reached,
                { subjectType: contentType, via: dependency.via },
              ]);
            }
          }
        }
      }
    }

    return { byField, bySource };
  };

export const gatherSegmentJoinPaths = async (): Promise<
  Map<string, string[]>
> => {
  const byContentType = new Map<string, Set<string>>();

  for (const pluginName of await getPlugins()) {
    const plugin = await getPlugin(pluginName);
    const declared: SegmentRelationMeta[] =
      plugin.config?.meta?.segments?.segmentRelations || [];

    for (const relation of declared) {
      if (relation.join.via !== 'field') {
        continue;
      }

      const owner =
        relation.join.on === 'related'
          ? relation.relatedType
          : relation.subjectType;

      byContentType.set(
        owner,
        (byContentType.get(owner) || new Set<string>()).add(relation.join.path),
      );
    }
  }

  return new Map(
    [...byContentType].map(([contentType, paths]) => [contentType, [...paths]]),
  );
};
