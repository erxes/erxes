import {
  AUTOMATION_CORE_ACTIONS,
  getValueByPath,
  IAutomationExecAction,
  IAutomationExecutionDocument,
  TAiContext,
  TAiMemoryScope,
} from 'erxes-api-shared/core-modules';
import { IModels } from '../../connectionResolver';
import {
  findRanActionTypes,
  getActionPlacement,
  resolveRememberConfig,
} from '../../executions/actionPlacement';
import { IAiMemoryEventDocument } from '../../mongo/aiMemoryEvent';
import { findSubject } from '../../utils/loadSubject';
import { TAiAgentActionConfig } from '../aiAction/contract';
import { resolveAiMemoryScopeKey } from './store';

export const AI_MEMORY_BATCH_SIZE = 20;

// A caller that names no scope still gets one: whatever working memory is
// keyed by, so the same conversation finds its own past.
export const resolveAiMemoryScopes = (
  execution: IAutomationExecutionDocument,
  aiContext?: TAiContext | null,
): TAiMemoryScope[] => {
  const scopes = (aiContext?.memory?.scopes || []).filter(
    (scope) => !!scope?.type && !!scope?.id,
  );

  if (scopes.length) {
    return scopes;
  }

  const scopeKey = resolveAiMemoryScopeKey(execution, aiContext);

  return scopeKey ? [{ type: 'automations:scope', id: scopeKey }] : [];
};

const toScopeFilter = (scopes: TAiMemoryScope[]) => ({
  $or: scopes.map(({ type, id }) => ({
    scopes: { $elemMatch: { type, id } },
  })),
});

type TAiHandoff = {
  aiActionId: string;
  toolId: string;
  toolName: string;
  scopes: TAiMemoryScope[];
  memorizeFields: { actionId: string; key: string }[];
  args: Record<string, unknown>;
};

const toHandoff = (execAction: IAutomationExecAction): TAiHandoff | null => {
  const result = execAction.result as
    | {
        handoff?: {
          toolId?: string;
          name?: string;
          args?: Record<string, unknown>;
        };
        memoryScopes?: TAiMemoryScope[];
      }
    | undefined;

  if (!result?.handoff?.toolId || !result.memoryScopes?.length) {
    return null;
  }

  const tools =
    (
      (execAction.actionConfig || {}) as Partial<TAiAgentActionConfig> & {
        tools?: {
          id: string;
          memorizeFields?: { actionId: string; key: string }[];
        }[];
      }
    ).tools || [];

  return {
    aiActionId: execAction.actionId,
    toolId: result.handoff.toolId,
    toolName: result.handoff.name || '',
    scopes: result.memoryScopes,
    memorizeFields:
      tools.find(({ id }) => id === result.handoff?.toolId)?.memorizeFields ||
      [],
    args: result.handoff.args || {},
  };
};

// Everything after a handoff runs on that tool's branch — in this run, or in
// the workflow the tool started.
export const findAiHandoff = async (
  models: IModels,
  execution: IAutomationExecutionDocument,
): Promise<TAiHandoff | null> => {
  const own = [...(execution.actions || [])]
    .reverse()
    .find(({ actionType }) => actionType === AUTOMATION_CORE_ACTIONS.AI_AGENT);

  if (own) {
    return toHandoff(own);
  }

  if (!execution.parentExecutionId) {
    return null;
  }

  const parent = await models.Executions.findOne(
    { _id: execution.parentExecutionId },
    { actions: 1 },
  ).lean();
  const parentAgent = [...(parent?.actions || [])]
    .reverse()
    .find(({ actionType }) => actionType === AUTOMATION_CORE_ACTIONS.AI_AGENT);

  return parentAgent ? toHandoff(parentAgent) : null;
};

const toRecordId = (result: Record<string, unknown>) => {
  const object =
    result.object && typeof result.object === 'object'
      ? (result.object as Record<string, unknown>)
      : {};
  const id = result.objectId ?? result.targetId ?? object._id;

  return id == null || id === '' ? '' : String(id);
};

// A record is kept by id when the action is set to remember it (by default
// behind an agent's tool, as its plugin declares); a field only when that or
// the tool says so.
export const recordAiMemoryEvent = async ({
  models,
  execution,
  execAction,
}: {
  models: IModels;
  execution: IAutomationExecutionDocument;
  execAction: IAutomationExecAction;
}) => {
  if (execAction.actionType === AUTOMATION_CORE_ACTIONS.AI_AGENT) {
    return;
  }

  const result =
    execAction.result && typeof execAction.result === 'object'
      ? (execAction.result as Record<string, unknown>)
      : null;

  if (!result) {
    return;
  }

  const handoff = await findAiHandoff(models, execution);

  if (!handoff) {
    return;
  }

  const action = {
    type: execAction.actionType,
    config: execAction.actionConfig,
  };
  const remember = await resolveRememberConfig(
    action,
    await findRanActionTypes(models, execution),
  );
  const recordId = remember ? toRecordId(result) : '';
  const keys = new Set([
    ...(remember?.fields || []),
    ...handoff.memorizeFields
      .filter(({ actionId }) => actionId === execAction.actionId)
      .map(({ key }) => key),
  ]);
  const fields: Record<string, unknown> = {};

  for (const key of keys) {
    const { found, value } = getValueByPath(result, key);
    const resolved = found ? value : key === '_id' ? recordId : undefined;

    if (resolved !== undefined && resolved !== '') {
      fields[key] = resolved;
    }
  }

  if (!recordId && !Object.keys(fields).length) {
    return;
  }

  // A plugin action's type ends in its method, which is not a record type.
  const { targetSourceType } = (await getActionPlacement(action.type)) as {
    targetSourceType?: string;
  };
  const typeParts = execAction.actionType.split('.');
  const recordType =
    targetSourceType ||
    (typeParts.length > 2
      ? typeParts.slice(0, -1).join('.')
      : execAction.actionType);

  await models.AiMemoryEvents.create({
    scopes: handoff.scopes,
    automationId: execution.automationId,
    executionId: String(execution._id),
    aiActionId: handoff.aiActionId,
    toolId: handoff.toolId,
    toolName: handoff.toolName,
    sourceActionId: execAction.actionId,
    sourceActionType: execAction.actionType,
    record: recordId ? { type: recordType, id: recordId } : undefined,
    fields,
  });
};

export const loadAiMemoryEvents = async ({
  models,
  scopes,
  page = 1,
}: {
  models: IModels;
  scopes: TAiMemoryScope[];
  page?: number;
}) => {
  if (!scopes.length) {
    return { events: [] as IAiMemoryEventDocument[], total: 0 };
  }

  const filter = toScopeFilter(scopes);
  const [events, total] = await Promise.all([
    models.AiMemoryEvents.find(filter)
      .sort({ createdAt: -1 })
      .skip((Math.max(1, page) - 1) * AI_MEMORY_BATCH_SIZE)
      .limit(AI_MEMORY_BATCH_SIZE)
      .lean(),
    models.AiMemoryEvents.countDocuments(filter),
  ]);

  return { events, total };
};

// The handoff argument through which the agent names an earlier record:
// `ticket` → ticketId, after what the action remembering it calls it.
export const toAiMemoryRecordParameter = (as: string) => `${as}Id`;

// The records these actions made for the same conversation or customer,
// newest first, each once: what a tool acting on an earlier record can pick.
// One deleted since, or that its owner says takes no follow-up, is no choice.
export const loadAiMemoryRecords = async ({
  subdomain,
  models,
  automationId,
  sourceActionIds,
  scopes,
}: {
  subdomain: string;
  models: IModels;
  automationId: string;
  sourceActionIds: string[];
  scopes: TAiMemoryScope[];
}) => {
  if (!scopes.length || !sourceActionIds.length) {
    return [];
  }

  const events = await models.AiMemoryEvents.find({
    ...toScopeFilter(scopes),
    automationId,
    sourceActionId: { $in: sourceActionIds },
    'record.id': { $exists: true },
  })
    .sort({ createdAt: -1 })
    .limit(AI_MEMORY_BATCH_SIZE)
    .lean();
  const seen = new Set<string>();
  const records = events.flatMap(({ record, fields }) => {
    if (!record || seen.has(record.id)) {
      return [];
    }

    seen.add(record.id);

    return [{ id: record.id, type: record.type, fields }];
  });
  const states = await Promise.all(
    records.map(({ type, id }) => findSubject(subdomain, type, id)),
  );

  return records
    .filter(
      (_, index) =>
        states[index]?.found && states[index]?.acceptsFollowUp !== false,
    )
    .map(({ id, fields }) => ({ id, fields }));
};

// The earlier record is the one the agent named: there can be several, so
// the latest is not a safe guess. Only a record this action made for the
// same conversation or customer can be named.
export const findAiMemoryRecord = async ({
  models,
  automationId,
  sourceActionId,
  scopes,
  recordIds,
}: {
  models: IModels;
  automationId: string;
  sourceActionId: string;
  scopes: TAiMemoryScope[];
  recordIds: string[];
}) => {
  if (!scopes.length || !recordIds.length) {
    return null;
  }

  const event = await models.AiMemoryEvents.findOne({
    ...toScopeFilter(scopes),
    automationId,
    sourceActionId,
    'record.id': { $in: recordIds },
  })
    .sort({ createdAt: -1 })
    .lean();

  return event?.record
    ? { ...event.record, sourceActionType: event.sourceActionType }
    : null;
};
