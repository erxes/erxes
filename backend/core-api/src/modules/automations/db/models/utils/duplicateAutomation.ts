import {
  IAutomation,
  IAutomationAction,
  IAutomationDocument,
} from 'erxes-api-shared/core-modules';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { customAlphabet } from 'nanoid';
import { IModels } from '~/connectionResolvers';

// Matches the builder's own id format, so duplicated nodes are
// indistinguishable from ones drawn by hand.
const generateNodeId = customAlphabet(
  'abcdefghijklmnopqrstuvwxyz0123456789',
  15,
);

const DUPLICATE_SUFFIX = /\s*\(duplicated(?:\s+(\d+))?\)\s*$/i;

// Canvas layout is not behaviour, so moving a node must not count as a change.
const VOLATILE_NODE_KEYS = ['position', 'style'];

type TIdMap = Map<string, string>;

type TAutomationFlow = Pick<IAutomation, 'triggers' | 'actions' | 'workflows'>;

/**
 * Every id this automation owns and therefore has to regenerate. Segment ids
 * are added separately, once their clones exist.
 */
const collectOwnedIds = (automation: IAutomationDocument) => {
  const ids = new Set<string>();

  const addAction = ({ id, config }: IAutomationAction) => {
    ids.add(id);

    for (const connect of config?.optionalConnects || []) {
      // The same string is also the button/quickReply `_id` it points at, so
      // one substitution keeps both sides of the pair consistent.
      if (connect?.optionalConnectId) {
        ids.add(connect.optionalConnectId);
      }
    }
  };

  for (const { id } of automation.triggers || []) {
    ids.add(id);
  }

  for (const action of automation.actions || []) {
    addAction(action);
  }

  for (const workflow of automation.workflows || []) {
    ids.add(workflow.id);
    (workflow.actions || []).forEach(addAction);
  }

  ids.delete('');

  return ids;
};

/**
 * Substitutes by value rather than by field name, so connection fields owned by
 * plugins (branch keys, folk keys) are remapped without this file knowing them.
 */
const remapValues = <T>(value: T, idMap: TIdMap): T => {
  if (typeof value === 'string') {
    return (idMap.get(value) ?? value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => remapValues(item, idMap)) as T;
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        remapValues(item, idMap),
      ]),
    ) as T;
  }

  return value;
};

/**
 * Copies a segment. The whole definition lives in `root`, so a clone is one
 * insert - there are no child documents to walk or re-point.
 */
const cloneSegment = async (
  models: IModels,
  segmentId: string,
  userId: string,
): Promise<string | undefined> => {
  const source = await models.Segments.findOne({ _id: segmentId }).lean();

  if (!source) {
    return undefined;
  }

  // Copied field by field so nothing identifying the source (`_id`,
  // `processId`) rides along into the clone.
  const clone = await models.Segments.create({
    contentType: source.contentType,
    name: source.name,
    description: source.description,
    color: source.color,
    root: source.root,
    visibility: source.visibility,
    ownerId: source.ownerId,
    status: source.status,
    revision: 1,
    createdBy: userId,
  });

  return clone._id;
};

/**
 * Segments referenced by triggers and by segment-backed actions. A duplicate
 * gets its own copies, otherwise editing one flow's audience would silently
 * change the other's.
 */
const cloneReferencedSegments = async (
  models: IModels,
  automation: IAutomationDocument,
  idMap: TIdMap,
  ownerId: string,
) => {
  const nodes = [
    ...(automation.triggers || []),
    ...(automation.actions || []),
    ...(automation.workflows || []).flatMap(({ actions = [] }) => actions),
  ];

  for (const { config } of nodes) {
    const segmentId = config?.contentId;

    if (typeof segmentId !== 'string' || !segmentId || idMap.has(segmentId)) {
      continue;
    }

    const clonedSegmentId = await cloneSegment(models, segmentId, ownerId);

    if (clonedSegmentId) {
      idMap.set(segmentId, clonedSegmentId);
    }
  }
};

/**
 * Duplicates count instead of chaining, so a copy of `Flow (duplicated 2)` is
 * `Flow (duplicated 3)` rather than `Flow (duplicated 2) (duplicated)`.
 */
export const generateDuplicateName = async (
  models: IModels,
  sourceName: string,
) => {
  const baseName =
    sourceName.replace(DUPLICATE_SUFFIX, '').trim() || sourceName;

  const siblings = await models.Automations.find(
    {
      name: new RegExp(
        `^${escapeRegExp(baseName)}\\s*\\(duplicated(\\s+\\d+)?\\)$`,
        'i',
      ),
    },
    { name: 1 },
  ).lean();

  if (!siblings.length) {
    return `${baseName} (duplicated)`;
  }

  const highest = siblings.reduce((max, { name }) => {
    const [, index] = name.match(DUPLICATE_SUFFIX) || [];

    return Math.max(max, index ? Number(index) : 1);
  }, 1);

  return `${baseName} (duplicated ${highest + 1})`;
};

export const buildDuplicatedAutomation = async (
  models: IModels,
  automation: IAutomationDocument,
  ownerId: string,
) => {
  const idMap: TIdMap = new Map();

  for (const id of collectOwnedIds(automation)) {
    idMap.set(id, generateNodeId());
  }

  await cloneReferencedSegments(models, automation, idMap, ownerId);

  // Listed rather than spread: identity, authorship and the duplicate marker of
  // the source must never leak into the copy, and a field added later should
  // have to opt in to being duplicated.
  return remapValues(
    {
      edgeType: automation.edgeType,
      flowDirection: automation.flowDirection,
      triggers: automation.triggers,
      actions: automation.actions,
      workflows: automation.workflows,
      tagIds: automation.tagIds,
    },
    idMap,
  );
};

/**
 * Drops layout keys and absent values so the two sides compare on meaning, not
 * on how the client happened to serialise them. Keys are sorted because the
 * result is compared as a string.
 */
const normalizeFlow = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeFlow);
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key, item]) =>
            !VOLATILE_NODE_KEYS.includes(key) &&
            item !== null &&
            item !== undefined &&
            !(Array.isArray(item) && !item.length) &&
            !(
              !Array.isArray(item) &&
              typeof item === 'object' &&
              !(item instanceof Date) &&
              !Object.keys(item).length
            ),
        )
        .map(([key, item]) => [key, normalizeFlow(item)])
        .sort(([left], [right]) => String(left).localeCompare(String(right))),
    );
  }

  return value;
};

const flowFingerprint = ({ triggers, actions, workflows }: TAutomationFlow) =>
  JSON.stringify(
    normalizeFlow({
      triggers: triggers || [],
      actions: actions || [],
      workflows: workflows || [],
    }),
  );

/**
 * Whether an incoming edit changes what the automation does. A partial edit
 * that omits the flow keeps the stored one, so renaming alone is not a change —
 * a renamed copy would still fire on exactly the same triggers.
 */
export const hasFlowChanged = (
  stored: TAutomationFlow,
  incoming: Partial<TAutomationFlow>,
) =>
  flowFingerprint(stored) !==
  flowFingerprint({
    triggers: incoming.triggers ?? stored.triggers,
    actions: incoming.actions ?? stored.actions,
    workflows: incoming.workflows ?? stored.workflows,
  });
