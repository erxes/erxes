import {
  TAutomationVersion,
  TAutomationVersionNode,
} from '@/automations/types';

const TEXT_PREVIEW_LENGTH = 80;
const HTML_PATTERN = /<[a-z][\s\S]*>/i;

/** A config value shaped for reading: what it is, not its raw JSON. */
export type TValuePreview =
  | { kind: 'empty' }
  | { kind: 'text'; text: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'html'; kilobytes: number }
  | { kind: 'document'; blocks: number }
  | { kind: 'list'; count: number };

export type TConfigChange = {
  key: string;
  label: string;
  before: TValuePreview;
  after: TValuePreview;
};

export type TRestoreStatus = 'same' | 'changed' | 'added' | 'removed';

export type TRestoreRow = {
  id: string;
  label: string;
  icon?: string;
  status: TRestoreStatus;
  changedFields: number;
};

type TFlowNodes = {
  triggers?: TAutomationVersionNode[];
  actions?: TAutomationVersionNode[];
  workflows?: TAutomationVersionNode[];
};

const truncate = (text: string) =>
  text.length > TEXT_PREVIEW_LENGTH
    ? `${text.slice(0, TEXT_PREVIEW_LENGTH)}…`
    : text;

const isEditorDocument = (
  value: object,
): value is { type: string; content: unknown[] } =>
  'type' in value &&
  (value as { type: unknown }).type === 'doc' &&
  Array.isArray((value as { content?: unknown }).content);

/** `replyToEmail` or `reply_to_email` as "Reply to email". */
export const humanizeKey = (key: string) => {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const previewOf = (value: unknown): TValuePreview => {
  if (value === undefined || value === null || value === '') {
    return { kind: 'empty' };
  }

  if (typeof value === 'boolean') {
    return { kind: 'boolean', value };
  }

  if (typeof value === 'string') {
    return HTML_PATTERN.test(value)
      ? {
          kind: 'html',
          kilobytes: Math.max(1, Math.round(value.length / 1024)),
        }
      : { kind: 'text', text: truncate(value) };
  }

  if (Array.isArray(value)) {
    return value.length
      ? { kind: 'list', count: value.length }
      : { kind: 'empty' };
  }

  if (typeof value === 'object') {
    if (isEditorDocument(value)) {
      return { kind: 'document', blocks: value.content.length };
    }

    return Object.keys(value).length
      ? { kind: 'text', text: truncate(JSON.stringify(value)) }
      : { kind: 'empty' };
  }

  return { kind: 'text', text: truncate(String(value)) };
};

const sameValue = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const nodesOf = ({
  triggers = [],
  actions = [],
  workflows = [],
}: TFlowNodes) => [...triggers, ...actions, ...workflows];

/** The node with this id anywhere in a saved flow. */
export const nodeInVersion = (
  detail: TFlowNodes | undefined,
  nodeId: string,
): TAutomationVersionNode | undefined =>
  detail ? nodesOf(detail).find(({ id }) => id === nodeId) : undefined;

/** Config keys that differ between two states of a node. */
export const configChangesOf = (
  before?: TAutomationVersionNode,
  after?: TAutomationVersionNode,
): TConfigChange[] => {
  const beforeConfig = before?.config || {};
  const afterConfig = after?.config || {};
  const keys = [
    ...new Set([...Object.keys(beforeConfig), ...Object.keys(afterConfig)]),
  ];

  return keys
    .filter((key) => !sameValue(beforeConfig[key], afterConfig[key]))
    .map((key) => ({
      key,
      label: humanizeKey(key),
      before: previewOf(beforeConfig[key]),
      after: previewOf(afterConfig[key]),
    }));
};

// Where a node leads, apart from its config
const linksOf = ({ nextActionId, actionId }: TAutomationVersionNode) => ({
  nextActionId,
  actionId,
});

const restoreRowOf = (
  id: string,
  current?: TAutomationVersionNode,
  restored?: TAutomationVersionNode,
): TRestoreRow => {
  const node = (restored || current) as TAutomationVersionNode;
  const base = { id, label: node.label || node.type || id, icon: node.icon };

  if (!current) {
    return { ...base, status: 'added', changedFields: 0 };
  }

  if (!restored) {
    return { ...base, status: 'removed', changedFields: 0 };
  }

  const changedFields = configChangesOf(current, restored).length;
  const linksChanged = !sameValue(linksOf(current), linksOf(restored));

  return {
    ...base,
    status: changedFields || linksChanged ? 'changed' : 'same',
    changedFields,
  };
};

/**
 * What restoring a version would do to the flow in the builder, step by
 * step: the version's steps in its order, then the ones it would take away.
 */
export const restoreSummaryOf = (
  current: TFlowNodes,
  restored: TFlowNodes,
): TRestoreRow[] => {
  const currentNodes = new Map(nodesOf(current).map((node) => [node.id, node]));
  const restoredNodes = nodesOf(restored);
  const restoredIds = new Set(restoredNodes.map(({ id }) => id));

  return [
    ...restoredNodes.map((node) =>
      restoreRowOf(node.id, currentNodes.get(node.id), node),
    ),
    ...[...currentNodes.values()]
      .filter(({ id }) => !restoredIds.has(id))
      .map((node) => restoreRowOf(node.id, node, undefined)),
  ];
};

/** The versions in which a node was added, changed or removed. */
export const versionsOfNode = (
  versions: TAutomationVersion[],
  nodeId: string,
) => versions.filter(({ changedNodeIds }) => changedNodeIds.includes(nodeId));

/** The version saved just before this one, when it is still kept. */
export const previousVersionOf = (
  versions: TAutomationVersion[],
  version: number,
) => versions.find((candidate) => candidate.version === version - 1);

export type TChangeKind = 'set' | 'cleared' | 'changed';

// `[[ user.x ]]` or `{{ trigger.x }}`: a reference resolved when the step runs
const EXPRESSION_PATTERN = /^\s*(\[\[[\s\S]*\]\]|\{\{[\s\S]*\}\})\s*$/;

export const isExpressionPreview = (preview: TValuePreview) =>
  preview.kind === 'text' && EXPRESSION_PATTERN.test(preview.text);

/** Whether a field was filled in, emptied, or given another value. */
export const changeKindOf = ({ before, after }: TConfigChange): TChangeKind => {
  if (before.kind === 'empty') {
    return 'set';
  }

  return after.kind === 'empty' ? 'cleared' : 'changed';
};
