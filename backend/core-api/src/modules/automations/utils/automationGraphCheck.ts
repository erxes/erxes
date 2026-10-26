import {
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_CORE_TRIGGER_TYPES,
  AUTOMATION_STATUSES,
  buildConfigContractIndex,
  checkAutomationNodeConfigs,
  isSegmentMembershipTrigger,
  TAutomationConfigCheck,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import {
  createExpectedError,
  getPlugins,
  sendCoreModuleProducer,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { normalizeSendEmailConfig } from '~/meta/automations/configNormalizers';
import { CORE_AUTOMATION_CONSTANTS } from '~/meta/automations/constants';
import { getAutomationConstants } from '../graphql/resolvers/utils/queriesUtils';
import {
  buildAutomationGraphReport,
  describeAutomationGraphIssues,
  findFlowReferenceIssues,
  selectConfigCheckNodes,
  TAutomationConfigCheckRequest,
  TAutomationFlowDraft,
  TAutomationGraphCatalog,
  TAutomationGraphReport,
  TAutomationGraphScope,
  TAutomationGraphTimings,
  withCanonicalPlaceholders,
  withNodePresentation,
} from './automationGraph';

// Engine nodes the builder draws without a catalogue entry.
const ENGINE_NODE_TYPES = [
  ...Object.values(AUTOMATION_CORE_ACTIONS),
  ...Object.values(AUTOMATION_CORE_TRIGGER_TYPES),
];

let coreConfigContracts:
  | ReturnType<typeof buildConfigContractIndex>
  | undefined;

const getCoreConfigContracts = () => {
  coreConfigContracts ??= buildConfigContractIndex(
    'core',
    CORE_AUTOMATION_CONSTANTS,
  );

  return coreConfigContracts;
};

export const loadAutomationGraphCatalog =
  async (): Promise<TAutomationGraphCatalog> => {
    const [{ triggersConst, actionsConst }, plugins] = await Promise.all([
      getAutomationConstants(),
      getPlugins(),
    ]);
    const nodes: TAutomationGraphCatalog['nodes'] = new Map();

    for (const node of [...triggersConst, ...actionsConst]) {
      if (node.type) {
        nodes.set(node.type, {
          pluginName: node.pluginName || 'core',
          hasConfigSchema: !!node.configJsonSchema,
          label: node.label,
          description: node.description,
          icon: node.icon,
        });
      }
    }

    for (const type of ENGINE_NODE_TYPES) {
      if (!nodes.has(type)) {
        nodes.set(type, { pluginName: 'core', hasConfigSchema: false });
      }
    }

    return { nodes, reachablePlugins: new Set(['core', ...plugins]) };
  };

const toCheckNodes = (requests: TAutomationConfigCheckRequest[]) =>
  requests.map(({ id, type, config }) => ({ id, type, config }));

/** Asks each owner about its own nodes; an owner that cannot answer leaves them unchecked. */
const checkConfigsWithOwners = async (
  subdomain: string,
  requests: TAutomationConfigCheckRequest[],
) => {
  const byOwner = new Map<string, TAutomationConfigCheckRequest[]>();

  for (const request of requests) {
    byOwner.set(request.pluginName, [
      ...(byOwner.get(request.pluginName) || []),
      request,
    ]);
  }

  const answers = await Promise.all(
    [...byOwner].map(
      async ([pluginName, group]): Promise<TAutomationConfigCheck[]> => {
        const nodes = toCheckNodes(group);

        if (pluginName === 'core') {
          return checkAutomationNodeConfigs(getCoreConfigContracts(), nodes, {
            subdomain,
          });
        }

        const answer: unknown = await sendCoreModuleProducer({
          subdomain,
          pluginName,
          moduleName: 'automations',
          producerName: TAutomationProducers.VALIDATE_CONFIGS,
          input: { nodes },
          defaultValue: [],
        });

        return Array.isArray(answer) ? answer : [];
      },
    ),
  );

  const checks = new Map(answers.flat().map((check) => [check.id, check]));

  // A node its owner did not answer for was asked about, not found valid.
  for (const { id, type } of requests) {
    if (!checks.has(id)) {
      checks.set(id, { id, type, status: 'unchecked' });
    }
  }

  return checks;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/** A membership trigger names its segment in segmentId, any other in contentId. */
const segmentOf = (config: unknown) => {
  const record = isRecord(config) ? config : {};
  const field = isSegmentMembershipTrigger({ config: record })
    ? 'segmentId'
    : 'contentId';
  const value = record[field];

  return { field, segmentId: typeof value === 'string' ? value.trim() : '' };
};

/** Segments live in core, so core checks them for triggers of every service. */
const checkTriggerSegments = async (
  subdomain: string,
  requests: TAutomationConfigCheckRequest[],
): Promise<TAutomationConfigCheck[]> => {
  if (!requests.length) {
    return [];
  }

  const wanted = requests.map((request) => ({
    ...request,
    ...segmentOf(request.config),
  }));
  const ids = wanted.map(({ segmentId }) => segmentId).filter(Boolean);
  const models = await generateModels(subdomain);
  const contentTypes = new Map(
    (
      await models.Segments.find(
        { _id: { $in: ids } },
        { _id: 1, contentType: 1 },
      ).lean()
    ).map(({ _id, contentType }) => [String(_id), contentType]),
  );

  return wanted.map(
    ({ id, type, field, segmentId }): TAutomationConfigCheck => {
      const path = `config.${field}`;

      if (!segmentId) {
        return {
          id,
          type,
          status: 'invalid',
          issues: [
            {
              path,
              check: 'segment',
              message: 'Choose the segment this trigger listens to',
            },
          ],
        };
      }

      if (!contentTypes.has(segmentId)) {
        return {
          id,
          type,
          status: 'invalid',
          issues: [
            {
              path,
              check: 'segment',
              malformed: true,
              message: `Segment "${segmentId}" does not exist`,
            },
          ],
        };
      }

      const contentType = contentTypes.get(segmentId);

      // The engine looks the triggering record up in it, so a segment of any
      // other record type never matches.
      if (contentType && contentType !== type) {
        return {
          id,
          type,
          status: 'invalid',
          issues: [
            {
              path,
              check: 'segment',
              malformed: true,
              message: `Segment "${segmentId}" is about ${contentType}, not ${type}; write the conditions with segmentFields(contentType: "${type}"), reaching other records through segmentRelations`,
            },
          ],
        };
      }

      return { id, type, status: 'valid' };
    },
  );
};

/** One verdict per node: any issue makes it invalid, any unanswered part unchecked. */
const mergeChecks = (
  first: TAutomationConfigCheck,
  second: TAutomationConfigCheck,
): TAutomationConfigCheck => {
  const issues = [...(first.issues || []), ...(second.issues || [])];

  if (issues.length) {
    return { id: first.id, type: first.type, status: 'invalid', issues };
  }

  const status =
    first.status === 'unchecked' || second.status === 'unchecked'
      ? 'unchecked'
      : 'valid';

  return { id: first.id, type: first.type, status };
};

const timed = async <T>(work: Promise<T>): Promise<[T, number]> => {
  const startedAt = Date.now();
  const result = await work;

  return [result, Date.now() - startedAt];
};

const checkConfigs = async (
  subdomain: string,
  requests: TAutomationConfigCheckRequest[],
  timings: TAutomationGraphTimings,
) => {
  const [[ownerChecks, ownersMs], [segmentChecks, segmentMs]] =
    await Promise.all([
      timed(
        checkConfigsWithOwners(
          subdomain,
          requests.filter(({ hasOwnerSchema }) => hasOwnerSchema),
        ),
      ),
      timed(
        checkTriggerSegments(
          subdomain,
          requests.filter((request) => request.listensToSegment),
        ),
      ),
    ]);

  // Owners answer schema and record rules in one call.
  timings.settings = ownersMs;
  timings.records = ownersMs;
  timings.owners = ownersMs;
  timings.segment = segmentMs;

  for (const check of segmentChecks) {
    const ownerCheck = ownerChecks.get(check.id);

    ownerChecks.set(
      check.id,
      ownerCheck ? mergeChecks(ownerCheck, check) : check,
    );
  }

  return ownerChecks;
};

export const checkAutomationGraph = async (
  subdomain: string,
  {
    next,
    previous,
    scope,
    catalog: loadedCatalog,
  }: {
    next: TAutomationFlowDraft;
    previous?: TAutomationFlowDraft | null;
    scope: TAutomationGraphScope;
    catalog?: TAutomationGraphCatalog;
  },
): Promise<TAutomationGraphReport> => {
  const catalog = loadedCatalog ?? (await loadAutomationGraphCatalog());
  const requests = selectConfigCheckNodes({ next, previous, catalog, scope });
  const timings: TAutomationGraphTimings = {};
  const configChecks = requests.length
    ? await checkConfigs(subdomain, requests, timings)
    : new Map<string, TAutomationConfigCheck>();
  const referencesStartedAt = Date.now();
  const referenceIssues = findFlowReferenceIssues(next);

  timings.references = Date.now() - referencesStartedAt;

  for (const [id, issues] of referenceIssues) {
    const node = [...(next.triggers || []), ...(next.actions || [])].find(
      (candidate) => candidate.id === id,
    );
    const found: TAutomationConfigCheck = {
      id,
      type: node?.type || '',
      status: 'invalid',
      issues,
    };
    const checked = configChecks.get(id);

    configChecks.set(id, checked ? mergeChecks(checked, found) : found);
  }

  const graphStartedAt = Date.now();
  const report = buildAutomationGraphReport({
    next,
    previous,
    catalog,
    configChecks,
    timings,
  });
  const graphMs = Date.now() - graphStartedAt;

  // Types, links and reach are judged together in one pass.
  return {
    ...report,
    checks: report.checks.map((check) =>
      ['types', 'links', 'reach'].includes(check.key)
        ? { ...check, ms: graphMs }
        : check,
    ),
  };
};

// Core's own actions written outside the builder are stored as it writes them.
const CORE_CONFIG_NORMALIZERS = new Map<string, (config: unknown) => unknown>([
  [AUTOMATION_CORE_ACTIONS.SEND_EMAIL, normalizeSendEmailConfig],
]);

const withCoreConfigs = <T extends { type?: string; config?: unknown }>(
  actions: T[],
): T[] =>
  actions.map((action) => {
    const normalize = CORE_CONFIG_NORMALIZERS.get(action.type || '');

    return normalize && action.config !== undefined
      ? { ...action, config: normalize(action.config) }
      : action;
  });

/**
 * The flow as it should be stored: written the way the builder writes it and
 * completed with what the builder would have filled in, then refused if a
 * rule rejects what this save introduces.
 */
export const prepareAutomationFlow = async (
  subdomain: string,
  {
    next,
    previous,
  }: { next: TAutomationFlowDraft; previous?: TAutomationFlowDraft | null },
): Promise<TAutomationFlowDraft> => {
  const catalog = await loadAutomationGraphCatalog();
  const prepared = {
    ...next,
    triggers: withNodePresentation(
      withCanonicalPlaceholders(next.triggers || []),
      catalog,
    ),
    actions: withNodePresentation(
      withCoreConfigs(withCanonicalPlaceholders(next.actions || [])),
      catalog,
    ),
  };
  const report = await checkAutomationGraph(subdomain, {
    next: prepared,
    previous,
    scope: 'save',
    catalog,
  });

  if (!report.canSave) {
    const verb =
      next.status === AUTOMATION_STATUSES.ACTIVE ? 'activate' : 'save';

    throw createExpectedError(
      `Cannot ${verb} automation:\n${describeAutomationGraphIssues(report)}`,
      'AUTOMATION_GRAPH_INVALID',
    );
  }

  return prepared;
};
