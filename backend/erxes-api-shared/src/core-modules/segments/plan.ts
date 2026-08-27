import {
  SegmentMeasure,
  SegmentNode,
  segmentFieldRef,
  segmentRelationRef,
  walkSegmentNodes,
} from './nodes';

/**
 * Turns a batch of segments into the smallest set of requests that answers all
 * of them.
 *
 * Segments fan out - one ticket's `stageId` change touches 53 of them - but the
 * work does not: those 53 read the same handful of fields off the same
 * documents. Planning collects the union of what they need, groups it by owning
 * plugin, and leaves the tree walking to `decideSegmentNode` once the values
 * are in hand. Pure, so a plan can be asserted without a database.
 */

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
  /** What to measure over the related records. */
  measure: SegmentMeasure;
  /** Narrows which related records the measure sees. */
  child?: SegmentNode;
  /**
   * Subject id -> related ids, for a relation whose edge is stored outside the
   * measuring plugin. The dispatcher resolves it before the call, so the
   * plugin measures over ids it owns instead of reaching into another
   * service's collection. Absent for a join the plugin can make itself.
   */
  edges?: Record<string, string[]>;
};

export type SegmentValueRequest = SegmentFieldRequest | SegmentRelationRequest;

export type SegmentEvaluationPlan = {
  subjectType: string;
  subjectIds: string[];
  /** Plugin name -> the values it has to resolve, deduplicated and sorted. */
  requestsByPlugin: Map<string, SegmentValueRequest[]>;
  /**
   * Refs no plugin owns. Every segment that needs one of these stays `unknown`
   * rather than silently evaluating as if the value were unset.
   */
  unresolvable: string[];
};

export type SegmentPlanInput = {
  subjectType: string;
  subjectIds: string[];
  segments: SegmentPlannedSegment[];
  /** Relation key -> the plugin that can fold it. Relation meta supplies this. */
  relationOwners?: ReadonlyMap<string, string>;
};

/** `sales:deal` -> `sales`. */
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

/** Every ref the plan expects back, in the order the requests are grouped. */
export const planValueRefs = (plan: SegmentEvaluationPlan): string[] => [
  ...[...plan.requestsByPlugin.values()].flatMap((requests) =>
    requests.map((request) => request.ref),
  ),
  ...plan.unresolvable,
];
