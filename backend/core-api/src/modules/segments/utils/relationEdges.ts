import { IModels } from '~/connectionResolvers';

/**
 * Resolves relations whose edge is a core relation record.
 *
 * A plugin can only join on a path it stores itself, and a deal stores no
 * customer ids - the link lives in core's own `relations` collection. Core
 * reads it here, one query per related type for the whole batch, and hands
 * each plugin the ids it should measure. That keeps the join honest without
 * letting a plugin query another service's data.
 */

/** Subject id -> the related ids it is linked to. */
export type SegmentRelationEdges = Record<string, string[]>;

export const relationEdgesFor = async (
  models: IModels,
  {
    subjectType,
    relatedType,
    subjectIds,
  }: { subjectType: string; relatedType: string; subjectIds: string[] },
): Promise<SegmentRelationEdges> => {
  if (!subjectIds.length) {
    return {};
  }

  const records = await models.Relations.find(
    {
      entities: {
        $elemMatch: {
          contentType: subjectType,
          contentId: { $in: subjectIds },
        },
      },
      'entities.contentType': relatedType,
    },
    { entities: 1, _id: 0 },
  ).lean();

  const wanted = new Set(subjectIds);
  const edges: SegmentRelationEdges = {};

  for (const record of records) {
    const subject = record.entities.find(
      (entity) =>
        entity.contentType === subjectType && wanted.has(entity.contentId),
    );

    // A relation between two records of the same type has both ends in one
    // list, so the far end is found by identity rather than by type alone.
    const related = record.entities.find(
      (entity) => entity !== subject && entity.contentType === relatedType,
    );

    if (!subject || !related) {
      continue;
    }

    (edges[subject.contentId] ||= []).push(related.contentId);
  }

  return edges;
};

/**
 * The subjects reachable from a set of related records - the same edges read
 * backwards.
 *
 * This is how a changed deal finds the customers whose membership it can move:
 * the event names the deal, but the segment is about the customer.
 */
export const subjectsForRelatedRecords = async (
  models: IModels,
  {
    subjectType,
    relatedType,
    relatedIds,
  }: { subjectType: string; relatedType: string; relatedIds: string[] },
): Promise<string[]> => {
  if (!relatedIds.length) {
    return [];
  }

  const records = await models.Relations.find(
    {
      entities: {
        $elemMatch: {
          contentType: relatedType,
          contentId: { $in: relatedIds },
        },
      },
      'entities.contentType': subjectType,
    },
    { entities: 1, _id: 0 },
  ).lean();

  const wanted = new Set(relatedIds);
  const subjects = new Set<string>();

  for (const record of records) {
    const related = record.entities.find(
      (entity) =>
        entity.contentType === relatedType && wanted.has(entity.contentId),
    );

    const subject = record.entities.find(
      (entity) => entity !== related && entity.contentType === subjectType,
    );

    if (related && subject) {
      subjects.add(subject.contentId);
    }
  }

  return [...subjects];
};
