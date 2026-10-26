import {
  AUTOMATION_BRANCH_KEYS,
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_STATUSES,
  IAutomation,
  TAutomationConfigCheck,
  TAutomationConfigCheckNode,
  TAutomationConfigIssue,
} from 'erxes-api-shared/core-modules';
import { valueFingerprint } from '../db/models/utils/duplicateAutomation';

/**
 * Rules a flow must meet before it is stored or run. A save is judged only on
 * what it introduces, so history the builder already wrote is never re-judged:
 *  - a new or retyped node must have a type some service declares;
 *  - a new or changed link must point to a node of this flow;
 *  - a node runs only with a config its declared schema accepts, so going live
 *    checks every node, and an edit while live checks the nodes it changes;
 *  - a draft may be incomplete, but a value it changes may not be malformed,
 *    since the builder cannot open a field holding a shape it never writes;
 *  - every trigger but a custom one listens to a segment that must exist,
 *    checked the same way whichever service declares the trigger.
 * Nodes inside workflows are left to validateWorkflowBindings.
 */

export type TAutomationFlowDraft = Pick<
  IAutomation,
  'status' | 'triggers' | 'actions' | 'workflows'
>;

export type TAutomationGraphNodeKind = 'trigger' | 'action';

type TDeclaredNode = {
  pluginName: string;
  hasConfigSchema: boolean;
  /** What the builder shows for the node, given to nodes written without it. */
  label?: string;
  description?: string;
  icon?: string;
};

export type TAutomationGraphCatalog = {
  /** Every node type some reachable service declares, with its owner. */
  nodes: Map<string, TDeclaredNode>;
  /** Services whose catalogue is known; an unknown type of any other is unjudged. */
  reachablePlugins: Set<string>;
};

type TPresentedNode = {
  type?: string;
  label?: string;
  description?: string;
  icon?: string;
};

const PLACEHOLDER = /\{\{([^{}]*)\}\}/g;

// Only JSON-shaped values are rewritten; a Date or an ObjectId stays as is.
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

/**
 * `{{ key }}`, one space inside each pair of braces, is how the builder writes
 * a variable. Every reader accepts any spacing, so writing every author's
 * variables that way changes nothing a run does.
 */
export const canonicalPlaceholders = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value.replace(PLACEHOLDER, (match, inner: string) =>
      inner.trim() ? `{{ ${inner.trim()} }}` : match,
    );
  }

  if (Array.isArray(value)) {
    return value.map(canonicalPlaceholders);
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        canonicalPlaceholders(entry),
      ]),
    );
  }

  return value;
};

export const withCanonicalPlaceholders = <T extends { config?: unknown }>(
  nodes: T[],
): T[] =>
  nodes.map((node) =>
    node.config === undefined
      ? node
      : { ...node, config: canonicalPlaceholders(node.config) },
  );

/**
 * A node written outside the builder (the assistant, an import) gets the
 * label, description and icon the builder takes from the catalogue; the
 * builder's form refuses nodes without them. What the author wrote stays.
 */
export const withNodePresentation = <T extends TPresentedNode>(
  nodes: T[],
  catalog: TAutomationGraphCatalog,
): T[] =>
  nodes.map((node) => {
    const declared = catalog.nodes.get(node.type || '');

    if (!declared) {
      return node;
    }

    const { label, description, icon } = declared;

    return {
      ...node,
      ...(node.label === undefined && label !== undefined && { label }),
      ...(node.description === undefined &&
        description !== undefined && { description }),
      ...(node.icon === undefined && icon !== undefined && { icon }),
    };
  });

export type TAutomationGraphIssue = {
  nodeId: string;
  nodeType: string;
  kind: TAutomationGraphNodeKind;
  problem: 'unknownType' | 'missingLink' | 'invalidConfig' | 'unreachable';
  message: string;
  details?: TAutomationConfigIssue[];
  /** The save this report was made for is refused because of it. */
  blocksSave: boolean;
};

export type TAutomationGraphUnchecked = {
  nodeId: string;
  nodeType: string;
  kind: TAutomationGraphNodeKind;
  reason: 'noConfigSchema' | 'ownerUnavailable';
};

export type TAutomationGraphReport = {
  /** The save this report was made for would be stored. */
  canSave: boolean;
  /**
   * Going live now would not be refused for anything this report checked; an
   * unreachable node never runs, so it is reported without refusing.
   */
  canActivate: boolean;
  issues: TAutomationGraphIssue[];
  unchecked: TAutomationGraphUnchecked[];
  /** The same findings, one entry per kind of check, in the order they run. */
  checks: TAutomationGraphCheck[];
};

export const AUTOMATION_GRAPH_CHECK_KEYS = [
  'types',
  'links',
  'reach',
  'segment',
  'settings',
  'records',
  'references',
  'owners',
] as const;

export type TAutomationGraphCheckKey =
  (typeof AUTOMATION_GRAPH_CHECK_KEYS)[number];

export type TAutomationGraphCheck = {
  key: TAutomationGraphCheckKey;
  /** bad refuses going live; warn is shown but does not. */
  status: 'ok' | 'bad' | 'warn';
  /** How long the check took, where it was timed. */
  ms?: number;
  items: {
    nodeId: string;
    nodeType: string;
    kind: TAutomationGraphNodeKind;
    message: string;
    path?: string;
  }[];
};

export type TAutomationGraphTimings = Partial<
  Record<TAutomationGraphCheckKey, number>
>;

// Checks whose findings are shown without refusing activation.
const WARNING_CHECKS: TAutomationGraphCheckKey[] = ['reach', 'owners'];

const CONFIG_CHECK_KEYS: Record<
  NonNullable<TAutomationConfigIssue['check']>,
  TAutomationGraphCheckKey
> = {
  schema: 'settings',
  records: 'records',
  segment: 'segment',
  references: 'references',
};

const groupChecks = (
  issues: TAutomationGraphIssue[],
  unchecked: TAutomationGraphUnchecked[],
  timings: TAutomationGraphTimings,
): TAutomationGraphCheck[] => {
  const items = new Map<
    TAutomationGraphCheckKey,
    TAutomationGraphCheck['items']
  >(AUTOMATION_GRAPH_CHECK_KEYS.map((key) => [key, []]));
  const add = (
    key: TAutomationGraphCheckKey,
    item: TAutomationGraphCheck['items'][number],
  ) => items.get(key)?.push(item);

  for (const issue of issues) {
    const subject = {
      nodeId: issue.nodeId,
      nodeType: issue.nodeType,
      kind: issue.kind,
    };

    if (issue.problem === 'unknownType') {
      add('types', { ...subject, message: issue.message });
    } else if (issue.problem === 'missingLink') {
      add('links', { ...subject, message: issue.message });
    } else if (issue.problem === 'unreachable') {
      add('reach', { ...subject, message: issue.message });
    } else {
      for (const { path, message, check } of issue.details || []) {
        add(CONFIG_CHECK_KEYS[check || 'schema'], {
          ...subject,
          path,
          message,
        });
      }
    }
  }

  for (const { nodeId, nodeType, kind, reason } of unchecked) {
    if (reason === 'ownerUnavailable') {
      add('owners', {
        nodeId,
        nodeType,
        kind,
        message: 'Its service did not answer, so its settings were not checked',
      });
    }
  }

  return AUTOMATION_GRAPH_CHECK_KEYS.map((key) => {
    const found = items.get(key) || [];
    const status = !found.length
      ? 'ok'
      : WARNING_CHECKS.includes(key)
      ? 'warn'
      : 'bad';

    return { key, status, ms: timings[key], items: found };
  });
};

/** `save` checks only what decides the save; `report` checks every config. */
export type TAutomationGraphScope = 'save' | 'report';

type TGraphNode = {
  id: string;
  type: string;
  kind: TAutomationGraphNodeKind;
  isCustom?: boolean;
  config?: Record<string, unknown>;
  links: Record<string, string>;
};

export type TAutomationConfigCheckRequest = TAutomationConfigCheckNode & {
  pluginName: string;
  /** Its owner declared a schema, so the owner is asked. */
  hasOwnerSchema: boolean;
  /** The engine checks the segment it listens to. */
  listensToSegment: boolean;
};

export const listensToSegment = (node: {
  kind: TAutomationGraphNodeKind;
  isCustom?: boolean;
}) => node.kind === 'trigger' && !node.isCustom;

const isActive = (status?: string) => status === AUTOMATION_STATUSES.ACTIVE;

export const getNodeTypeOwner = (type: string) =>
  type.includes(':') ? type.split(':')[0] : 'core';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const asRecord = (value: unknown) => (isRecord(value) ? value : {});

type TLinkSource = {
  type?: string;
  config?: unknown;
  actionId?: string;
  nextActionId?: string;
  targetActionId?: string;
};

/** Where a node hands over: its chain, its target, and branch handles kept in config. */
const linksOf = (
  kind: TAutomationGraphNodeKind,
  node: TLinkSource,
): Record<string, string> => {
  const config = asRecord(node.config);
  const entries: [string, unknown][] =
    kind === 'trigger'
      ? [['actionId', node.actionId]]
      : [
          ['nextActionId', node.nextActionId],
          ['targetActionId', node.targetActionId],
          ...Object.values(AUTOMATION_BRANCH_KEYS).map(
            (key): [string, unknown] => [`config.${key}`, config[key]],
          ),
        ];

  if (node.type === AUTOMATION_CORE_ACTIONS.IF) {
    entries.push(['config.yes', config.yes], ['config.no', config.no]);
  }

  if (node.type === AUTOMATION_CORE_ACTIONS.FIND_OBJECT) {
    entries.push(
      ['config.isExists', config.isExists],
      ['config.notExists', config.notExists],
    );
  }

  const optionalConnects = Array.isArray(config.optionalConnects)
    ? config.optionalConnects
    : [];

  optionalConnects.forEach((connect, index) =>
    entries.push([
      `config.optionalConnects.${index}.actionId`,
      asRecord(connect).actionId,
    ]),
  );

  return Object.fromEntries(
    entries.filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && !!entry[1],
    ),
  );
};

const nodesOf = (flow?: Partial<TAutomationFlowDraft> | null): TGraphNode[] => [
  ...(flow?.triggers || []).map((trigger) => ({
    id: trigger.id,
    type: trigger.type || '',
    kind: 'trigger' as const,
    isCustom: !!trigger.isCustom,
    config: asRecord(trigger.config),
    links: linksOf('trigger', trigger),
  })),
  ...(flow?.actions || []).map((action) => ({
    id: action.id,
    type: action.type || '',
    kind: 'action' as const,
    config: asRecord(action.config),
    links: linksOf('action', action),
  })),
];

/**
 * Actions no trigger leads to. targetActionId names whose data an action
 * reads, not where the run goes, so it does not count.
 */
const unreachableActionsOf = (nodes: TGraphNode[]) => {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const reached = new Set<string>();
  const queue = nodes
    .filter(({ kind }) => kind === 'trigger')
    .map(({ id }) => id);

  for (let id = queue.pop(); id !== undefined; id = queue.pop()) {
    const node = byId.get(id);

    if (!node || reached.has(id)) {
      continue;
    }

    reached.add(id);
    queue.push(
      ...Object.entries(node.links)
        .filter(([field]) => field !== 'targetActionId')
        .map(([, target]) => target),
    );
  }

  return reached.size
    ? nodes.filter(({ kind, id }) => kind === 'action' && !reached.has(id))
    : [];
};

const linkTargetsOf = (flow: TAutomationFlowDraft) =>
  new Set([
    ...(flow.actions || []).map(({ id }) => id),
    ...(flow.workflows || []).flatMap((workflow) => [
      workflow.id,
      ...(workflow.actions || []).map(({ id }) => id),
    ]),
  ]);

// Stored configs may predate canonical placeholders; spacing is not an edit.
const isConfigChanged = (node: TGraphNode, previous?: TGraphNode) =>
  !previous ||
  previous.type !== node.type ||
  valueFingerprint(canonicalPlaceholders(previous.config)) !==
    valueFingerprint(canonicalPlaceholders(node.config));

const goesLive = (
  next: TAutomationFlowDraft,
  previous?: TAutomationFlowDraft | null,
) => isActive(next.status) && !isActive(previous?.status);

const staysLive = (
  next: TAutomationFlowDraft,
  previous?: TAutomationFlowDraft | null,
) => isActive(next.status) && isActive(previous?.status);

/** Whether a config problem on this node refuses the save being judged. */
const configBlocksSave = (
  node: TGraphNode,
  previousNode: TGraphNode | undefined,
  next: TAutomationFlowDraft,
  previous?: TAutomationFlowDraft | null,
) =>
  goesLive(next, previous) ||
  (staysLive(next, previous) && isConfigChanged(node, previousNode));

const ACTION_REFERENCE = /\{\{\s*actions\.([^.\s{}]+)/g;

/** Branch handles a node declares; undefined when this check does not know the type. */
const branchIdsOf = (node: TGraphNode): string[] | undefined => {
  const config = asRecord(node.config);
  const idsOf = (list: unknown) =>
    (Array.isArray(list) ? list : [])
      .map((item) => asRecord(item).id)
      .filter((id): id is string => typeof id === 'string' && !!id);

  if (node.type === AUTOMATION_CORE_ACTIONS.AI_AGENT) {
    return idsOf(
      config.goalType === 'splitTopic' ? config.topics : config.tools,
    );
  }

  if (node.type === AUTOMATION_CORE_ACTIONS.SPLIT) {
    return [...idsOf(config.options), 'fallback'];
  }

  return undefined;
};

// Conditions without a segment compare values: of the trigger's own output
// (a custom trigger) or of the action targetActionId names.
const readsConditionsWithoutSource = (
  node: TGraphNode,
  targetActionId: string | undefined,
  hasCustomTrigger: boolean,
) => {
  const { options } = asRecord(node.config);

  return (
    node.type === AUTOMATION_CORE_ACTIONS.SPLIT &&
    !targetActionId &&
    !hasCustomTrigger &&
    Array.isArray(options) &&
    options.some((option) => {
      const { segmentId, config } = asRecord(option);
      const { conditions } = asRecord(config);

      return !segmentId && Array.isArray(conditions) && conditions.length > 0;
    })
  );
};

/**
 * What a config refers to elsewhere in the flow: steps its variables read,
 * branch handles its links use, and where a split's conditions read from.
 * Reported like a config issue, so the same draft and live rules apply.
 */
export const findFlowReferenceIssues = (
  flow: TAutomationFlowDraft,
): Map<string, TAutomationConfigIssue[]> => {
  const nodes = nodesOf(flow);
  const actionIds = new Set(
    nodes.filter(({ kind }) => kind === 'action').map(({ id }) => id),
  );
  const hasCustomTrigger = nodes.some(
    ({ kind, isCustom }) => kind === 'trigger' && isCustom,
  );
  const targetOf = new Map(
    (flow.actions || []).map(({ id, targetActionId }) => [id, targetActionId]),
  );
  const found = new Map<string, TAutomationConfigIssue[]>();

  for (const node of nodes) {
    const issues: TAutomationConfigIssue[] = [];
    const references = new Set(
      [...JSON.stringify(node.config ?? {}).matchAll(ACTION_REFERENCE)].map(
        ([, id]) => id,
      ),
    );

    for (const id of references) {
      if (!actionIds.has(id) || id === node.id) {
        issues.push({
          check: 'references',
          malformed: true,
          path: 'config',
          message: `{{ actions.${id}... }} reads a step this flow does not have`,
        });
      }
    }

    const branchIds = branchIdsOf(node);
    const connects = asRecord(node.config).optionalConnects;

    if (branchIds && Array.isArray(connects)) {
      connects.forEach((connect, index) => {
        const handle = asRecord(connect).optionalConnectId;

        if (typeof handle === 'string' && !branchIds.includes(handle)) {
          issues.push({
            check: 'references',
            malformed: true,
            path: `config.optionalConnects.${index}.optionalConnectId`,
            message: `"${handle}" is not a branch of this step; use ${
              branchIds.join(', ') || 'a declared id'
            }`,
          });
        }
      });
    }

    if (
      readsConditionsWithoutSource(
        node,
        targetOf.get(node.id),
        hasCustomTrigger,
      )
    ) {
      issues.push({
        check: 'references',
        malformed: true,
        path: 'targetActionId',
        message:
          "These conditions compare values, but nothing names where they come from: set targetActionId to the step whose output they read (an AI agent's attributes.*), or match the record with a segmentId",
      });
    }

    if (issues.length) {
      found.set(node.id, issues);
    }
  }

  return found;
};

/** The nodes whose config must be sent to their owners for this check. */
export const selectConfigCheckNodes = ({
  next,
  previous,
  catalog,
  scope,
}: {
  next: TAutomationFlowDraft;
  previous?: TAutomationFlowDraft | null;
  catalog: TAutomationGraphCatalog;
  scope: TAutomationGraphScope;
}): TAutomationConfigCheckRequest[] => {
  const previousById = new Map(
    nodesOf(previous).map((node) => [node.id, node]),
  );

  return nodesOf(next)
    .filter((node) => {
      const declared = catalog.nodes.get(node.type);

      return !!declared && (declared.hasConfigSchema || listensToSegment(node));
    })
    .filter(
      (node) =>
        scope === 'report' ||
        configBlocksSave(node, previousById.get(node.id), next, previous) ||
        // A draft is still checked for what it changes: malformed values
        // are refused even there.
        isConfigChanged(node, previousById.get(node.id)),
    )
    .map((node) => ({
      id: node.id,
      type: node.type,
      config: node.config,
      pluginName:
        catalog.nodes.get(node.type)?.pluginName || getNodeTypeOwner(node.type),
      hasOwnerSchema: !!catalog.nodes.get(node.type)?.hasConfigSchema,
      listensToSegment: listensToSegment(node),
    }));
};

export const buildAutomationGraphReport = ({
  next,
  previous,
  catalog,
  configChecks,
  timings = {},
}: {
  next: TAutomationFlowDraft;
  previous?: TAutomationFlowDraft | null;
  catalog: TAutomationGraphCatalog;
  /** Results for the nodes selectConfigCheckNodes returned, by node id. */
  configChecks: Map<string, TAutomationConfigCheck>;
  timings?: TAutomationGraphTimings;
}): TAutomationGraphReport => {
  const previousById = new Map(
    nodesOf(previous).map((node) => [node.id, node]),
  );
  const targets = linkTargetsOf(next);
  const issues: TAutomationGraphIssue[] = [];
  const unchecked: TAutomationGraphUnchecked[] = [];

  for (const node of nodesOf(next)) {
    const previousNode = previousById.get(node.id);
    const subject = { nodeId: node.id, nodeType: node.type, kind: node.kind };
    const declared = catalog.nodes.get(node.type);

    if (!previousNode || previousNode.type !== node.type) {
      if (!node.type) {
        issues.push({
          ...subject,
          problem: 'unknownType',
          message: `${node.kind} "${node.id}" has no type`,
          blocksSave: true,
        });
      } else if (!declared) {
        if (catalog.reachablePlugins.has(getNodeTypeOwner(node.type))) {
          issues.push({
            ...subject,
            problem: 'unknownType',
            message: `${node.kind} "${node.id}" has unknown type "${node.type}"`,
            blocksSave: true,
          });
        } else {
          unchecked.push({ ...subject, reason: 'ownerUnavailable' });
        }
      }
    }

    for (const [field, target] of Object.entries(node.links)) {
      if (previousNode?.links[field] === target || targets.has(target)) {
        continue;
      }

      issues.push({
        ...subject,
        problem: 'missingLink',
        message: `${node.kind} "${node.id}" ${field} points to missing node "${target}"`,
        blocksSave: true,
      });
    }

    if (!declared) {
      continue;
    }

    const check = configChecks.get(node.id);

    if (!check) {
      if (!declared.hasConfigSchema && !listensToSegment(node)) {
        unchecked.push({ ...subject, reason: 'noConfigSchema' });
      }

      continue;
    }

    if (check.status === 'unchecked') {
      unchecked.push({ ...subject, reason: 'ownerUnavailable' });
    } else if (check.status === 'invalid') {
      issues.push({
        ...subject,
        problem: 'invalidConfig',
        message: `${node.kind} "${node.id}" (${node.type}) has an invalid config`,
        details: check.issues,
        blocksSave:
          configBlocksSave(node, previousNode, next, previous) ||
          (isConfigChanged(node, previousNode) &&
            !!check.issues?.some(({ malformed }) => malformed)),
      });
    }
  }

  for (const node of unreachableActionsOf(nodesOf(next))) {
    issues.push({
      nodeId: node.id,
      nodeType: node.type,
      kind: node.kind,
      problem: 'unreachable',
      message: `action "${node.id}" (${node.type}) is not reached from any trigger, so it never runs; link it from a trigger's actionId or an earlier action`,
      blocksSave: false,
    });
  }

  return {
    canSave: !issues.some(({ blocksSave }) => blocksSave),
    canActivate: !issues.some(({ problem }) => problem !== 'unreachable'),
    issues,
    unchecked,
    checks: groupChecks(issues, unchecked, timings),
  };
};

export const describeAutomationGraphIssues = (report: TAutomationGraphReport) =>
  report.issues
    .filter(({ blocksSave }) => blocksSave)
    .map(({ message, details }) =>
      [
        message,
        ...(details || []).map(
          ({ path, message: detail }) => `  ${path}: ${detail}`,
        ),
      ].join('\n'),
    )
    .join('\n');
