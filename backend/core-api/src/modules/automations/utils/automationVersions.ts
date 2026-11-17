import {
  IAutomationAction,
  IAutomationTrigger,
  IAutomationWorkflow,
} from 'erxes-api-shared/core-modules';
import { createHash } from 'crypto';

// Where a node sits on the canvas: moving it changes nothing it does
const LAYOUT_KEYS = ['position', 'style'];

export type TAutomationFlow = {
  triggers?: IAutomationTrigger[];
  actions?: IAutomationAction[];
  workflows?: IAutomationWorkflow[];
};

type TFlowNode = { id: string } & Record<string, unknown>;

const withoutLayout = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(withoutLayout);
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !LAYOUT_KEYS.includes(key))
        .map(([key, nested]) => [key, withoutLayout(nested)]),
    );
  }

  return value;
};

/** JSON with keys sorted, so the same content always hashes the same. */
export const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const entries = Object.entries(value)
      .filter(([, nested]) => nested !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`,
      );

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value ?? null);
};

const hashOf = (value: unknown) =>
  createHash('sha1')
    .update(stableStringify(withoutLayout(value)))
    .digest('hex');

const nodesOf = ({
  triggers = [],
  actions = [],
  workflows = [],
}: TAutomationFlow) =>
  [...triggers, ...actions, ...workflows] as unknown as TFlowNode[];

/** One hash for what the flow does, layout aside. */
export const flowContentHash = ({
  triggers = [],
  actions = [],
  workflows = [],
}: TAutomationFlow) => hashOf({ triggers, actions, workflows });

/** Nodes added, changed or removed between two versions of a flow. */
export const changedFlowNodeIds = (
  previous: TAutomationFlow | null,
  next: TAutomationFlow,
) => {
  const nextNodes = nodesOf(next);

  if (!previous) {
    return nextNodes.map(({ id }) => id);
  }

  const previousHashes = new Map(
    nodesOf(previous).map((node) => [node.id, hashOf(node)]),
  );
  const nextIds = new Set(nextNodes.map(({ id }) => id));

  const changed = nextNodes
    .filter((node) => previousHashes.get(node.id) !== hashOf(node))
    .map(({ id }) => id);
  const removed = [...previousHashes.keys()].filter((id) => !nextIds.has(id));

  return [...changed, ...removed];
};

export type TVersionMark = { version: number; createdAt: Date | string };

const timeOf = (value?: Date | string) =>
  value ? new Date(value).getTime() : Number.NaN;

/**
 * The version in effect at a moment: the last one saved before it. Null when
 * the moment comes before any version was kept.
 */
export const versionAt = (
  marks: TVersionMark[],
  at?: Date | string,
): number | null => {
  const moment = timeOf(at);

  if (Number.isNaN(moment)) {
    return null;
  }

  return marks.reduce<number | null>(
    (current, { version, createdAt }) =>
      timeOf(createdAt) <= moment ? version : current,
    null,
  );
};

/**
 * Which version each step of a run used, in step order. A step's own start
 * decides it, so a step resumed after an edit reads the later version.
 */
export const stepVersionsOf = (
  marks: TVersionMark[],
  steps: { startedAt?: string; createdAt?: string }[],
  runStartedAt?: Date | string,
) =>
  steps.map((step) =>
    versionAt(marks, step.startedAt || step.createdAt || runStartedAt),
  );
