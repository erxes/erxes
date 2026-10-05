import { sendTRPCMessage } from '../../utils';
import { SegmentChangedEvent } from './events';
import { gatherSegmentRelations } from './relationRegistry';

const idsAt = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [value]).filter(
    (id): id is string => typeof id === 'string' && id.length > 0,
  );

/**
 * Which of a segment's subjects a change to `docIds` can move. Shared by the
 * membership worker and by automations, whose trigger segments are never
 * materialized and so must be re-asked when a related record changes.
 */
export const segmentSubjectsReachedBy = async (
  subdomain: string,
  segment: { _id: string; contentType: string },
  changedTypes: string[],
  docIds: string[],
  changed?: SegmentChangedEvent['changed'],
  onSkip?: (message: string, data?: Record<string, unknown>) => void,
): Promise<string[]> => {
  if (changedTypes.includes(segment.contentType)) {
    return docIds;
  }

  const { relations } = await gatherSegmentRelations(segment.contentType);

  const reaching = [...relations.values()].filter((relation) =>
    changedTypes.includes(relation.relatedType),
  );

  const subjects = new Set<string>();

  for (const relation of reaching) {
    if (relation.join.via === 'field') {
      const moved = changed?.[relation.join.path];

      if (relation.join.on === 'subject') {
        docIds.forEach((id) => subjects.add(id));
      } else if (moved) {
        idsAt(moved.prev).forEach((id) => subjects.add(id));
        idsAt(moved.next).forEach((id) => subjects.add(id));
      } else {
        onSkip?.(`${segment._id}: ${relation.key} moved without a diff`, {
          relatedType: relation.relatedType,
        });
      }

      continue;
    }

    const found: string[] = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'segment',
      action: 'relationSubjects',
      input: {
        subjectType: relation.join.subjectRecordType,
        relatedType: relation.join.relatedRecordType,
        relatedIds: docIds,
      },
      defaultValue: [],
    });

    found.forEach((id) => subjects.add(id));
  }

  return [...subjects];
};
