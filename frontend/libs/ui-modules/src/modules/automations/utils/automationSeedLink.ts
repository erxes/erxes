import { generateAutomationElementId } from './automationUtils';

const AUTOMATION_SEED_PARAMS = {
  triggerType: 'seedTriggerType',
  triggerId: 'seedTriggerId',
  triggerConfig: 'seedTriggerConfig',
  actionType: 'seedActionType',
  actionId: 'seedActionId',
  actions: 'seedActions',
  name: 'seedName',
} as const;

// Kept apart from the seed: the builder still needs it after the first save
// turns the seed link into an edit link.
const AUTOMATION_RETURN_PARAMS = {
  path: 'returnTo',
  label: 'returnLabel',
} as const;

// The page a seeded automation was opened from, offered as the way back.
export type TAutomationReturnLink = {
  path: string;
  label: string;
};

// A node of a seeded flow. The builder takes its label and icon from the
// registered action, so a seed names only what it configures.
export type TAutomationSeedAction = {
  id: string;
  type: string;
  config?: Record<string, unknown>;
  nextActionId?: string;
};

export type TAutomationSeedParams = {
  // Left out when the trigger is the user's to choose; `actions` then opens alone.
  triggerType?: string;
  triggerId?: string;
  triggerConfig: Record<string, unknown>;
  // The first action, already wired to the trigger. Its config starts empty so
  // the builder opens on something to fill in rather than something to add.
  actionType?: string;
  actionId?: string;
  // A whole flow; the first one is wired to the trigger. Wins over actionType.
  actions?: TAutomationSeedAction[];
  name?: string;
};

/**
 * Builds a link to the automation builder that opens with a trigger already in
 * place and its configuration sidebar open, so a module can hand its own
 * context (a bot, a page, a form) straight into a new automation.
 */
export const buildAutomationSeedLink = ({
  triggerType,
  triggerConfig,
  actionType,
  actions,
  name,
  returnTo,
}: {
  triggerType?: string;
  triggerConfig?: Record<string, unknown>;
  actionType?: string;
  actions?: TAutomationSeedAction[];
  name?: string;
  returnTo?: TAutomationReturnLink;
}) => {
  const triggerId = generateAutomationElementId();
  const params = new URLSearchParams();

  if (triggerType) {
    params.set(AUTOMATION_SEED_PARAMS.triggerType, triggerType);
    params.set(AUTOMATION_SEED_PARAMS.triggerId, triggerId);
    // The builder already opens its sidebar on whatever activeNodeId names.
    params.set('activeNodeId', triggerId);
  }

  if (actions?.length) {
    params.set(AUTOMATION_SEED_PARAMS.actions, JSON.stringify(actions));
  } else if (actionType) {
    params.set(AUTOMATION_SEED_PARAMS.actionType, actionType);
    params.set(
      AUTOMATION_SEED_PARAMS.actionId,
      generateAutomationElementId([triggerId]),
    );
  }

  if (triggerConfig) {
    params.set(
      AUTOMATION_SEED_PARAMS.triggerConfig,
      JSON.stringify(triggerConfig),
    );
  }

  if (name) {
    params.set(AUTOMATION_SEED_PARAMS.name, name);
  }

  if (returnTo) {
    params.set(AUTOMATION_RETURN_PARAMS.path, returnTo.path);
    params.set(AUTOMATION_RETURN_PARAMS.label, returnTo.label);
  }

  return `/automations/create?${params}`;
};

// Only a path inside this app: a link must not be able to send people elsewhere.
const isInternalPath = (path: string) =>
  path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\');

export const parseAutomationReturnLink = (
  searchParams: URLSearchParams,
): TAutomationReturnLink | undefined => {
  const path = searchParams.get(AUTOMATION_RETURN_PARAMS.path) || '';

  if (!isInternalPath(path)) {
    return undefined;
  }

  return {
    path,
    label: searchParams.get(AUTOMATION_RETURN_PARAMS.label) || '',
  };
};

/** The query string that carries a return link onto another builder URL. */
export const automationReturnLinkSearch = (
  returnTo?: TAutomationReturnLink,
) => {
  if (!returnTo) {
    return '';
  }

  const params = new URLSearchParams();
  params.set(AUTOMATION_RETURN_PARAMS.path, returnTo.path);
  params.set(AUTOMATION_RETURN_PARAMS.label, returnTo.label);

  return `?${params}`;
};

const parseSeedConfig = (value: string | null): Record<string, unknown> => {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);

    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const isSeedAction = (value: unknown): value is TAutomationSeedAction => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const { id, type, config, nextActionId } = value as Record<string, unknown>;

  return (
    typeof id === 'string' &&
    !!id &&
    typeof type === 'string' &&
    !!type &&
    (config === undefined ||
      (!!config && typeof config === 'object' && !Array.isArray(config))) &&
    (nextActionId === undefined || typeof nextActionId === 'string')
  );
};

// A malformed flow is dropped whole: half a graph would open with dangling
// connections.
const parseSeedActions = (
  value: string | null,
): TAutomationSeedAction[] | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) && parsed.every(isSeedAction)
      ? parsed
      : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Reads back what `buildAutomationSeedLink` wrote. Returns nothing when the
 * link carries no seed; the caller still has to check the trigger type against
 * the registered constants before trusting it.
 */
export const parseAutomationSeedParams = (
  searchParams: URLSearchParams,
): TAutomationSeedParams | undefined => {
  const triggerType =
    searchParams.get(AUTOMATION_SEED_PARAMS.triggerType) || undefined;
  const actions = parseSeedActions(
    searchParams.get(AUTOMATION_SEED_PARAMS.actions),
  );

  // A flow without a trigger still seeds; nothing at all does not.
  if (!triggerType && !actions?.length) {
    return undefined;
  }

  return {
    triggerType,
    triggerId: searchParams.get(AUTOMATION_SEED_PARAMS.triggerId) || undefined,
    actionType:
      searchParams.get(AUTOMATION_SEED_PARAMS.actionType) || undefined,
    actionId: searchParams.get(AUTOMATION_SEED_PARAMS.actionId) || undefined,
    actions,
    triggerConfig: parseSeedConfig(
      searchParams.get(AUTOMATION_SEED_PARAMS.triggerConfig),
    ),
    name: searchParams.get(AUTOMATION_SEED_PARAMS.name) || undefined,
  };
};
