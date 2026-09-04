import { SegmentOperator } from './operators';
import { z } from 'zod';

import { SegmentNode } from './nodes';
import { TSegmentProducers } from './types';

export const SegmentNodeSchema: z.ZodType<SegmentNode> = z.lazy(() =>
  z.union([
    z.object({
      kind: z.literal('group'),
      conjunction: z.enum(['and', 'or']),
      children: z.array(SegmentNodeSchema),
    }),
    z.object({
      kind: z.literal('field'),
      contentType: z.string(),
      fieldKey: z.string(),
      operator: z.nativeEnum(SegmentOperator),
      value: z.any().optional(),
      meta: z.record(z.string(), z.string()).optional(),
    }),
    z.object({
      kind: z.literal('relation'),
      relationKey: z.string(),
      measure: z.union([
        z.object({ op: z.enum(['exists', 'none', 'count']) }),
        z.object({
          op: z.enum(['sum', 'avg', 'min', 'max']),
          fieldKey: z.string(),
        }),
      ]),
      child: SegmentNodeSchema.optional(),
      operator: z.nativeEnum(SegmentOperator).optional(),
      value: z.any().optional(),
    }),
    z.object({
      kind: z.literal('segment'),
      segmentId: z.string(),
      exclude: z.boolean().optional(),
    }),
  ]),
);

export const SegmentBaseInput = z.object({
  subdomain: z.string(),
  data: z.any().optional(),
});

const EvaluateFieldsInputData = z.object({
  subjectType: z.string(),
  subjectIds: z.array(z.string()),
  timeZone: z.string().optional(),
  requests: z.array(
    z.union([
      z.object({
        kind: z.literal('field'),
        ref: z.string(),
        contentType: z.string(),
        fieldKey: z.string(),
      }),
      z.object({
        kind: z.literal('relation'),
        ref: z.string(),
        relationKey: z.string(),
        measure: z.union([
          z.object({ op: z.enum(['exists', 'none', 'count']) }),
          z.object({
            op: z.enum(['sum', 'avg', 'min', 'max']),
            fieldKey: z.string(),
          }),
        ]),
        child: SegmentNodeSchema.optional(),
        edges: z.record(z.string(), z.array(z.string())).optional(),
      }),
    ]),
  ),
});

export const EvaluateFieldsInput = SegmentBaseInput.extend({
  data: EvaluateFieldsInputData,
});

const SegmentMemberQueryInputData = z.object({
  contentType: z.string(),
  node: SegmentNodeSchema,
  ids: z.array(z.string()).optional(),
  timeZone: z.string().optional(),
});

const ListSegmentMembersInputData = SegmentMemberQueryInputData.extend({
  cursor: z.string().optional(),
  limit: z.number().int().positive().max(10000).optional(),
});

export const ListSegmentMembersInput = SegmentBaseInput.extend({
  data: ListSegmentMembersInputData,
});

export const CountSegmentMembersInput = SegmentBaseInput.extend({
  data: SegmentMemberQueryInputData,
});

const ApplyMembershipInputData = z.object({
  contentType: z.string(),
  updates: z.array(
    z.object({
      segmentId: z.string(),
      matched: z.array(z.string()),
      notMatched: z.array(z.string()),
    }),
  ),
  forget: z.array(z.string()).optional(),
  countFor: z.array(z.string()).optional(),
  transitions: z.boolean().optional(),
});

export const ApplyMembershipInput = SegmentBaseInput.extend({
  data: ApplyMembershipInputData,
});

export type TSegmentProducersInput = {
  [TSegmentProducers.EVALUATE_FIELDS]: z.infer<typeof EvaluateFieldsInputData>;
  [TSegmentProducers.LIST_MEMBERS]: z.infer<typeof ListSegmentMembersInputData>;
  [TSegmentProducers.COUNT_MEMBERS]: z.infer<
    typeof SegmentMemberQueryInputData
  >;
  [TSegmentProducers.APPLY_MEMBERSHIP]: z.infer<
    typeof ApplyMembershipInputData
  >;
};
