import {
  getSetPropertySelector,
  setProperty,
} from 'erxes-api-shared/core-modules';
import type {
  TAutomationProducers,
  TAutomationProducersInput,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import type { IModels } from '~/connectionResolvers';

type TConversationEventGroup = 'assignee' | 'status' | 'tag';

type TConversationEventCondition = {
  type: TConversationEventGroup;
  actions: string[];
  targetIds: string[];
};

type TEventChange = {
  prev?: unknown;
  current?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

const toStringValue = (value: unknown) =>
  typeof value === 'string' && value ? value : undefined;

const getConversationEventConditions = (
  config: Record<string, unknown>,
): TConversationEventCondition[] =>
  Array.isArray(config.conditions)
    ? config.conditions.reduce<TConversationEventCondition[]>(
        (conditions, condition) => {
          if (!isRecord(condition)) {
            return conditions;
          }

          if (
            condition.type !== 'assignee' &&
            condition.type !== 'status' &&
            condition.type !== 'tag'
          ) {
            return conditions;
          }

          return [
            ...conditions,
            {
              type: condition.type,
              actions: toStringArray(condition.actions),
              targetIds: toStringArray(condition.targetIds),
            },
          ];
        },
        [],
      )
    : [];

const getEventChange = (
  eventUpdateDescription: Record<string, unknown> | undefined,
  field: string,
): TEventChange | undefined => {
  const updated = eventUpdateDescription?.updated;

  if (!isRecord(updated)) {
    return undefined;
  }

  const change = updated[field];

  return isRecord(change) ? change : undefined;
};

const getAssigneeEventAction = (change?: TEventChange) => {
  const previousAssigneeId = toStringValue(change?.prev);
  const currentAssigneeId = toStringValue(change?.current);

  if (previousAssigneeId === currentAssigneeId) {
    return undefined;
  }

  if (currentAssigneeId) {
    return 'assigned';
  }

  if (previousAssigneeId) {
    return 'unassigned';
  }

  return undefined;
};

const getStatusEventAction = (change?: TEventChange) => {
  const previousStatus = toStringValue(change?.prev);
  const currentStatus = toStringValue(change?.current);

  if (!currentStatus || previousStatus === currentStatus) {
    return undefined;
  }

  if (previousStatus === 'closed' && currentStatus === 'open') {
    return 'reopened';
  }

  return currentStatus;
};

const hasMatchingAssigneeCondition = (
  conditions: TConversationEventCondition[],
  eventUpdateDescription?: Record<string, unknown>,
) => {
  const change = getEventChange(eventUpdateDescription, 'assignedUserId');
  const action = getAssigneeEventAction(change);

  if (!action) {
    return false;
  }

  const targetUserId =
    action === 'assigned'
      ? toStringValue(change?.current)
      : toStringValue(change?.prev);

  return conditions.some(
    (condition) =>
      condition.type === 'assignee' &&
      condition.actions.includes(action) &&
      Boolean(targetUserId && condition.targetIds.includes(targetUserId)),
  );
};

const hasMatchingStatusCondition = (
  conditions: TConversationEventCondition[],
  eventUpdateDescription?: Record<string, unknown>,
) => {
  const action = getStatusEventAction(
    getEventChange(eventUpdateDescription, 'status'),
  );

  return Boolean(
    action &&
      conditions.some(
        (condition) =>
          condition.type === 'status' && condition.actions.includes(action),
      ),
  );
};

const hasMatchingTagCondition = (
  conditions: TConversationEventCondition[],
  eventUpdateDescription?: Record<string, unknown>,
) => {
  const change = getEventChange(eventUpdateDescription, 'tagIds');
  const previousTagIds = toStringArray(change?.prev);
  const currentTagIds = toStringArray(change?.current);
  const addedTagIds = currentTagIds.filter(
    (tagId) => !previousTagIds.includes(tagId),
  );
  const removedTagIds = previousTagIds.filter(
    (tagId) => !currentTagIds.includes(tagId),
  );

  return conditions.some((condition) => {
    if (condition.type !== 'tag' || !condition.targetIds.length) {
      return false;
    }

    const hasAddedMatch =
      condition.actions.includes('added') &&
      condition.targetIds.some((targetId) => addedTagIds.includes(targetId));
    const hasRemovedMatch =
      condition.actions.includes('removed') &&
      condition.targetIds.some((targetId) => removedTagIds.includes(targetId));

    return hasAddedMatch || hasRemovedMatch;
  });
};

const getConversationSetPropertyModel = (models: IModels, module: string) => {
  const [, moduleName, collectionName] = module.replace(/\./g, ':').split(':');
  const collectionType = collectionName || moduleName;

  if (moduleName === 'inbox' && collectionType === 'conversations') {
    return models.Conversations;
  }

  throw new Error(`Unsupported inbox set property module: ${module}`);
};

export const inboxAutomationWorkers = {
  checkCustomTrigger: async ({
    collectionType,
    relationType,
    config,
    eventUpdateDescription,
  }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER]) => {
    if (collectionType !== 'conversations' || relationType !== 'event') {
      return false;
    }

    const conditions = getConversationEventConditions(config);

    return (
      hasMatchingAssigneeCondition(conditions, eventUpdateDescription) ||
      hasMatchingStatusCondition(conditions, eventUpdateDescription) ||
      hasMatchingTagCondition(conditions, eventUpdateDescription)
    );
  },

  setProperties: async (
    data: TAutomationProducersInput[TAutomationProducers.SET_PROPERTIES],
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const { action, execution, targetType } = data;
    const { module, rules, setPropertyTarget } = action.config;
    const model = getConversationSetPropertyModel(models, module);
    const selector = await getSetPropertySelector({
      subdomain,
      module,
      execution,
      targetType,
      relation: setPropertyTarget?.relation,
    });

    return await setProperty({
      models,
      subdomain,
      module,
      rules,
      execution,
      setPropertyTarget,
      selector,
      fetchItems: async (itemSelector) => await model.find(itemSelector).lean(),
      update: async ({ selector: itemSelector, modifier }) =>
        await model.updateMany(itemSelector, modifier),
      targetType,
    });
  },
};
