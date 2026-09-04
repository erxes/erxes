import { IModels } from '~/connectionResolvers';

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
