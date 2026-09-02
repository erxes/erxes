import {
  segmentFieldRef,
  segmentReferenceRef,
  segmentRelationRef,
} from './nodeRefs';
import { walkSegmentNodes } from './walkNodes';
import { SEGMENT_MEMBERSHIP_FIELD, SegmentMeasure, SegmentNode } from './nodes';

export type SegmentPlannedSegment = {
  _id: string;
  root: SegmentNode;
};

export type SegmentFieldRequest = {
  kind: 'field';
  ref: string;
  contentType: string;
  fieldKey: string;
};

export type SegmentRelationRequest = {
  kind: 'relation';
  ref: string;
  relationKey: string;
  measure: SegmentMeasure;
  child?: SegmentNode;
  edges?: Record<string, string[]>;
};

export type SegmentValueRequest = SegmentFieldRequest | SegmentRelationRequest;

export type SegmentEvaluationPlan = {
  subjectType: string;
  subjectIds: string[];
  requestsByPlugin: Map<string, SegmentValueRequest[]>;
  unresolvable: string[];
};

export type SegmentPlanInput = {
  subjectType: string;
  subjectIds: string[];
  segments: SegmentPlannedSegment[];
  relationOwners?: ReadonlyMap<string, string>;
};

const pluginOf = (contentType: string): string | undefined =>
  contentType.split(':')[0] || undefined;

export const buildSegmentEvaluationPlan = ({
  subjectType,
  subjectIds,
  segments,
  relationOwners,
}: SegmentPlanInput): SegmentEvaluationPlan => {
  const byPlugin = new Map<string, Map<string, SegmentValueRequest>>();
  const unresolvable = new Set<string>();

  const add = (plugin: string, request: SegmentValueRequest) => {
    const existing = byPlugin.get(plugin);

    if (existing) {
      existing.set(request.ref, request);
      return;
    }

    byPlugin.set(plugin, new Map([[request.ref, request]]));
  };

  for (const segment of segments) {
    for (const node of walkSegmentNodes(segment.root)) {
      if (node.kind === 'field') {
        const plugin = pluginOf(node.contentType);
        const ref = segmentFieldRef(node);

        if (!plugin) {
          unresolvable.add(ref);
          continue;
        }

        add(plugin, {
          kind: 'field',
          ref,
          contentType: node.contentType,
          fieldKey: node.fieldKey,
        });

        continue;
      }

      if (node.kind === 'segment') {
        const plugin = pluginOf(subjectType);
        const ref = segmentReferenceRef(subjectType);

        if (!plugin) {
          unresolvable.add(ref);
          continue;
        }

        add(plugin, {
          kind: 'field',
          ref,
          contentType: subjectType,
          fieldKey: SEGMENT_MEMBERSHIP_FIELD,
        });

        continue;
      }

      if (node.kind === 'relation') {
        const ref = segmentRelationRef(node);
        const plugin = relationOwners?.get(node.relationKey);

        if (!plugin) {
          unresolvable.add(ref);
          continue;
        }

        add(plugin, {
          kind: 'relation',
          ref,
          relationKey: node.relationKey,
          measure: node.measure,
          child: node.child,
        });
      }
    }
  }

  const requestsByPlugin = new Map<string, SegmentValueRequest[]>();

  for (const plugin of [...byPlugin.keys()].sort()) {
    const requests = [
      ...(byPlugin.get(plugin) as Map<string, SegmentValueRequest>).values(),
    ];

    requestsByPlugin.set(
      plugin,
      requests.sort((left, right) => left.ref.localeCompare(right.ref)),
    );
  }

  return {
    subjectType,
    subjectIds,
    requestsByPlugin,
    unresolvable: [...unresolvable].sort(),
  };
};

export const planValueRefs = (plan: SegmentEvaluationPlan): string[] => [
  ...[...plan.requestsByPlugin.values()].flatMap((requests) =>
    requests.map((request) => request.ref),
  ),
  ...plan.unresolvable,
];
