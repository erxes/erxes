import { generateAutomationElementId } from './automationUtils';

const AUTOMATION_SEED_PARAMS = {
  triggerType: 'seedTriggerType',
  triggerId: 'seedTriggerId',
  triggerConfig: 'seedTriggerConfig',
  actionType: 'seedActionType',
  actionId: 'seedActionId',
  name: 'seedName',
} as const;

export type TAutomationSeedParams = {
  triggerType: string;
  triggerId?: string;
  triggerConfig: Record<string, unknown>;
  // The first action, already wired to the trigger. Its config starts empty so
  // the builder opens on something to fill in rather than something to add.
  actionType?: string;
  actionId?: string;
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
  name,
}: {
  triggerType: string;
  triggerConfig?: Record<string, unknown>;
  actionType?: string;
  name?: string;
}) => {
  const triggerId = generateAutomationElementId();

  const params = new URLSearchParams({
    [AUTOMATION_SEED_PARAMS.triggerType]: triggerType,
    [AUTOMATION_SEED_PARAMS.triggerId]: triggerId,
    // The builder already opens its sidebar on whatever activeNodeId names.
    activeNodeId: triggerId,
  });

  if (actionType) {
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

  return `/automations/create?${params}`;
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

/**
 * Reads back what `buildAutomationSeedLink` wrote. Returns nothing when the
 * link carries no seed; the caller still has to check the trigger type against
 * the registered constants before trusting it.
 */
export const parseAutomationSeedParams = (
  searchParams: URLSearchParams,
): TAutomationSeedParams | undefined => {
  const triggerType = searchParams.get(AUTOMATION_SEED_PARAMS.triggerType);

  if (!triggerType) {
    return undefined;
  }

  return {
    triggerType,
    triggerId: searchParams.get(AUTOMATION_SEED_PARAMS.triggerId) || undefined,
    actionType: searchParams.get(AUTOMATION_SEED_PARAMS.actionType) || undefined,
    actionId: searchParams.get(AUTOMATION_SEED_PARAMS.actionId) || undefined,
    triggerConfig: parseSeedConfig(
      searchParams.get(AUTOMATION_SEED_PARAMS.triggerConfig),
    ),
    name: searchParams.get(AUTOMATION_SEED_PARAMS.name) || undefined,
  };
};
