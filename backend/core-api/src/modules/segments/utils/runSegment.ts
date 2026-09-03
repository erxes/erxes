import {
  evaluateSegmentBatch,
  gatherSegmentRelations,
  normalizeSegmentOperator,
  SegmentMemberCount,
  SegmentMemberPage,
  SegmentNode,
  SegmentOperator,
  SegmentRelationNode,
  segmentTimeZone,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  countCoreSegmentMembers,
  listCoreSegmentMembers,
} from '~/meta/segments/members';
import { ISegmentDocument } from '../db/definitions/segments';
import { subjectsForRelatedRecords } from './relationEdges';
import { coreSegmentGateway } from './segmentGateway';

export const listSegmentMembers = async (
  models: IModels,
  subdomain: string,
  segment: ISegmentDocument,
  page: { cursor?: string; limit?: number; ids?: string[] } = {},
): Promise<SegmentMemberPage> => {
  const input: MemberQueryInput = {
    contentType: segment.contentType,
    node: segment.root,
    timeZone: await segmentTimeZone(subdomain),
    ...page,
  };

  const candidates =
    pluginOf(segment.contentType) === 'core'
      ? await listCoreSegmentMembers(models, input)
      : await sendCoreModuleProducer({
          subdomain,
          moduleName: 'segments',
          pluginName: pluginOf(segment.contentType),
          producerName: TSegmentProducers.LIST_MEMBERS,
          method: 'query',
          input,
          defaultValue: { ids: [] } as SegmentMemberPage,
        });

  return settleCandidates(models, subdomain, segment, candidates);
};

export const estimateSegmentMembers = async (
  models: IModels,
  subdomain: string,
  segment: ISegmentDocument,
): Promise<{ total: number | null }> => {
  const input: MemberQueryInput = {
    contentType: segment.contentType,
    node: segment.root,
    timeZone: await segmentTimeZone(subdomain),
  };

  const counted =
    pluginOf(segment.contentType) === 'core'
      ? await countCoreSegmentMembers(models, input)
      : await sendCoreModuleProducer({
          subdomain,
          moduleName: 'segments',
          pluginName: pluginOf(segment.contentType),
          producerName: TSegmentProducers.COUNT_MEMBERS,
          method: 'query',
          input,
          defaultValue: { count: 0, unsupported: [segment.contentType] },
        });

  return { total: counted.unsupported?.length ? null : counted.count };
};

const SHORTCUT_LIMIT = 10_000;

const needsAtLeastOne = (node: SegmentRelationNode): boolean => {
  if (node.measure.op === 'exists') {
    return true;
  }

  if (node.measure.op !== 'count' || !node.operator) {
    return false;
  }

  return (
    normalizeSegmentOperator(node.operator) === SegmentOperator.NumberGt &&
    Number(node.value) >= 1
  );
};

const decisiveRelation = (root: SegmentNode): SegmentRelationNode | null => {
  const nodes =
    root.kind === 'group' && root.conjunction === 'and'
      ? root.children
      : [root];

  return (
    (nodes.find(
      (node) => node.kind === 'relation' && needsAtLeastOne(node),
    ) as SegmentRelationNode) || null
  );
};

const subjectsFromRelation = async (
  models: IModels,
  subdomain: string,
  segment: ISegmentDocument,
): Promise<string[] | null> => {
  const relation = decisiveRelation(segment.root);

  if (!relation?.child) {
    return null;
  }

  const { relations } = await gatherSegmentRelations(segment.contentType);
  const meta = relations.get(relation.relationKey);

  if (!meta || meta.join.via !== 'relation') {
    return null;
  }

  const page = await listSegmentMembers(
    models,
    subdomain,
    { contentType: meta.relatedType, root: relation.child } as ISegmentDocument,
    { limit: SHORTCUT_LIMIT },
  );

  if (page.nextCursor || page.unsupported?.length) {
    return null;
  }

  if (!page.ids.length) {
    return [];
  }

  return subjectsForRelatedRecords(models, {
    subjectType: meta.join.subjectRecordType,
    relatedType: meta.join.relatedRecordType,
    relatedIds: page.ids,
  });
};

const pluginOf = (contentType: string) => contentType.split(':')[0];

type MemberQueryInput = {
  contentType: string;
  node: SegmentNode;
  cursor?: string;
  limit?: number;
  ids?: string[];
  timeZone?: string;
};

const settleCandidates = async (
  models: IModels,
  subdomain: string,
  segment: ISegmentDocument,
  page: SegmentMemberPage,
): Promise<SegmentMemberPage> => {
  if (!page.unsupported?.length || !page.ids.length) {
    return page;
  }

  const { matched } = await evaluateSegmentBatch(
    coreSegmentGateway(models, subdomain),
    segment,
    page.ids,
  );

  return { ids: matched, nextCursor: page.nextCursor };
};

export const countSegmentMembers = async (
  models: IModels,
  subdomain: string,
  segment: ISegmentDocument,
  budgetMs?: number,
): Promise<SegmentMemberCount> => {
  const deadline = budgetMs ? Date.now() + budgetMs : undefined;

  const input: MemberQueryInput = {
    contentType: segment.contentType,
    node: segment.root,
    timeZone: await segmentTimeZone(subdomain),
  };

  const counted =
    pluginOf(segment.contentType) === 'core'
      ? await countCoreSegmentMembers(models, { ...input, budgetMs })
      : await sendCoreModuleProducer({
          subdomain,
          moduleName: 'segments',
          pluginName: pluginOf(segment.contentType),
          producerName: TSegmentProducers.COUNT_MEMBERS,
          method: 'query',
          input,
          defaultValue: { count: 0 } as SegmentMemberCount,
        });

  if (counted.exceeded || !counted.unsupported?.length) {
    return counted;
  }

  if (budgetMs) {
    const candidates = await subjectsFromRelation(models, subdomain, segment);

    if (candidates) {
      if (!candidates.length) {
        return { count: 0 };
      }

      const settled = await listSegmentMembers(models, subdomain, segment, {
        ids: candidates,
        limit: SHORTCUT_LIMIT,
      });

      return { count: settled.ids.length };
    }
  }

  let count = 0;
  let cursor: string | undefined;

  for (;;) {
    const page = await listSegmentMembers(models, subdomain, segment, {
      cursor,
    });

    count += page.ids.length;

    if (!page.nextCursor) {
      return { count };
    }

    if (deadline && Date.now() > deadline) {
      return { count, exceeded: true };
    }

    cursor = page.nextCursor;
  }
};

export const MAX_COLLECTED_MEMBERS = 50_000;

export const collectSegmentMembers = async (
  models: IModels,
  subdomain: string,
  segment: ISegmentDocument,
): Promise<string[]> => {
  const ids: string[] = [];
  let cursor: string | undefined;

  for (;;) {
    const page = await listSegmentMembers(models, subdomain, segment, {
      cursor,
    });

    ids.push(...page.ids);

    if (ids.length > MAX_COLLECTED_MEMBERS) {
      throw new Error(
        `This segment has more than ${MAX_COLLECTED_MEMBERS.toLocaleString()} members. Save it and filter by the segment itself instead of by its members.`,
      );
    }

    if (!page.nextCursor) {
      return ids;
    }

    cursor = page.nextCursor;
  }
};
