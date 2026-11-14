import {
  belongsToLookupCustomer,
  isPublicLookup,
  getAutomationFindObjectTarget,
  projectLookupRecord,
  splitType,
  TAiContext,
  TAutomationFindObjectResult,
  TAutomationFindObjectTargetDefinition,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import type { TAiToolRuntime } from '../aiAction/tools';

export const AI_LOOKUP_TOOL_PREFIX = 'lookup_';

export const AI_LOOKUP_NOT_FOUND = { found: false };

// Provider function names allow [a-z0-9_-] only
const toToolName = (label: string, objectType: string) =>
  `${AI_LOOKUP_TOOL_PREFIX}${(label || objectType)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')}`.slice(0, 64);

const runCustomerId = (aiContext?: TAiContext | null) => {
  const customerId = aiContext?.facts?.customerId;

  return typeof customerId === 'string' && customerId.trim()
    ? customerId.trim()
    : '';
};

type TFindObject = (input: {
  objectType: string;
  field: string;
  value: string;
  newest?: boolean;
}) => Promise<TAutomationFindObjectResult | null>;

export const runLookup = async ({
  target,
  customerId,
  args,
  findObject,
}: {
  target: TAutomationFindObjectTargetDefinition;
  customerId: string;
  args: Record<string, unknown>;
  findObject: TFindObject;
}) => {
  const lookup = target.lookup;

  if (!lookup) {
    return AI_LOOKUP_NOT_FOUND;
  }

  const isPublic = isPublicLookup(target);
  const byFields = lookup.byFields || [];
  const value = typeof args.value === 'string' ? args.value.trim() : '';
  // One searchable field needs no choosing
  const field =
    typeof args.field === 'string' && args.field
      ? args.field
      : byFields.length === 1
      ? byFields[0]
      : '';

  if (value && !byFields.includes(field)) {
    return { error: `field must be one of: ${byFields.join(', ')}` };
  }

  // Organization data has no "mine": it is found only by what was asked
  if (isPublic && !value) {
    return { error: 'value is required' };
  }

  if (!isPublic && !customerId) {
    return AI_LOOKUP_NOT_FOUND;
  }

  const result = await findObject(
    value
      ? { objectType: target.value, field, value }
      : {
          objectType: target.value,
          field: lookup.customerField || '',
          value: customerId,
          newest: true,
        },
  );

  if (!result) {
    throw new Error(`Could not read ${target.label}`);
  }

  const record = result.found ? result.object : null;

  if (
    !record ||
    (!isPublic && !belongsToLookupCustomer(target, record, customerId))
  ) {
    return AI_LOOKUP_NOT_FOUND;
  }

  return { found: true, record: projectLookupRecord(target, record) };
};

const buildParameters = (
  target: TAutomationFindObjectTargetDefinition,
): TAiToolRuntime['definition']['parameters'] => {
  const byFields = target.lookup?.byFields || [];
  const isPublic = isPublicLookup(target);

  if (!byFields.length) {
    return { type: 'object', properties: {}, required: [] };
  }

  return {
    type: 'object',
    properties: {
      field: {
        type: 'string',
        enum: byFields,
        description: 'Which identifier the value is.',
      },
      value: {
        type: 'string',
        description: isPublic
          ? 'The identifier to look up, e.g. a product code from the knowledge.'
          : "The value the customer gave, e.g. an order number. Leave out for the customer's most recent record.",
      },
    },
    required: isPublic ? ['value'] : [],
  };
};

/**
 * The lookups this agent has turned on, as read-only tools. A customer's own
 * record needs the run's customer, never a parameter; organization data
 * (stock) needs none.
 */
export const buildAiLookupTools = async ({
  subdomain,
  lookups,
  aiContext,
}: {
  subdomain: string;
  lookups: string[];
  aiContext?: TAiContext | null;
}): Promise<TAiToolRuntime[]> => {
  const customerId = runCustomerId(aiContext);

  if (!lookups.length) {
    return [];
  }

  const findObject: TFindObject = (input) =>
    sendCoreModuleProducer({
      subdomain,
      moduleName: 'automations',
      pluginName: splitType(input.objectType)[0],
      producerName: TAutomationProducers.FIND_OBJECT,
      input,
      defaultValue: null,
    });

  const targets = await Promise.all(
    [...new Set(lookups)].map((objectType) =>
      getAutomationFindObjectTarget(objectType).catch(() => undefined),
    ),
  );
  const usedNames = new Set<string>();

  return targets.flatMap((target) => {
    if (!target?.lookup || (!isPublicLookup(target) && !customerId)) {
      return [];
    }

    const name = toToolName(target.label, target.value);

    if (usedNames.has(name)) {
      return [];
    }

    usedNames.add(name);

    return [
      {
        toolId: `lookup:${target.value}`,
        kind: 'lookup' as const,
        definition: {
          name,
          description: target.lookup.description,
          parameters: buildParameters(target),
        },
        execute: (args: Record<string, unknown>) =>
          runLookup({ target, customerId, args, findObject }),
      },
    ];
  });
};
