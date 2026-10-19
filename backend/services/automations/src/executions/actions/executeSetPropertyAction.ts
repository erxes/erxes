import {
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_ERROR_CODES,
  buildFailedAction,
  buildSkippedAction,
  IAutomationAction,
  IAutomationExecutionDocument,
  splitType,
  TAutomationProducers,
  TAutomationSetPropertyChange,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import {
  findAiHandoff,
  findAiMemoryRecord,
  toAiMemoryRecordParameter,
} from '../../ai/memory/events';
import { generateModels } from '../../connectionResolver';
import { findSubject } from '../../utils/loadSubject';
import { resolveRememberConfig } from '../actionPlacement';

const APPLIED_STATUSES: TAutomationSetPropertyChange['status'][] = [
  'updated',
  'cleared',
];

// A target made on another tool branch of the same agent ran in an earlier
// execution; its record comes from the agent's long-term memory instead.
const withRememberedTarget = async (
  subdomain: string,
  action: IAutomationAction,
  execution: IAutomationExecutionDocument,
) => {
  const { targetActionId } = action;

  if (
    !targetActionId ||
    (execution.actions || []).some(
      ({ actionId }) => actionId === targetActionId,
    )
  ) {
    return { execution };
  }

  const models = await generateModels(subdomain);
  const handoff = await findAiHandoff(models, execution);
  const automation = await models.Automations.findOne(
    { _id: execution.automationId },
    { actions: 1 },
  ).lean();
  const source = (automation?.actions || []).find(
    ({ id }) => id === targetActionId,
  );
  const remember = source
    ? await resolveRememberConfig(
        source,
        new Set([AUTOMATION_CORE_ACTIONS.AI_AGENT]),
      )
    : undefined;
  const namedId = remember
    ? handoff?.args[toAiMemoryRecordParameter(remember.as)]
    : undefined;
  const record = handoff
    ? await findAiMemoryRecord({
        models,
        automationId: execution.automationId,
        sourceActionId: targetActionId,
        scopes: handoff.scopes,
        recordIds: typeof namedId === 'string' && namedId ? [namedId] : [],
      })
    : null;

  const state = record
    ? await findSubject(subdomain, record.type, record.id)
    : null;

  // The agent was offered only records that take a follow-up; one named past
  // that list, or that stopped taking them since, is not written to.
  if (!record || !state?.found || state.acceptsFollowUp === false) {
    return { execution, missing: true };
  }

  const plain = execution.toObject ? execution.toObject() : execution;

  return {
    execution: {
      ...plain,
      actions: [
        ...(plain.actions || []),
        {
          actionId: targetActionId,
          actionType: record.sourceActionType,
          result: { targetId: record.id },
        },
      ],
    },
  };
};

export const executeSetPropertyAction = async (
  subdomain: string,
  action: IAutomationAction,
  triggerType: string,
  targetType: string,
  execution: IAutomationExecutionDocument,
) => {
  const { module } = action.config;
  const [pluginName, moduleName, collectionType] = splitType(module);
  const target = await withRememberedTarget(subdomain, action, execution);

  // The agent sent this branch to an earlier record it could not name, or one
  // that no longer takes follow-ups: the request failed rather than had
  // nothing to do, so an error branch can tell the user.
  if (target.missing) {
    return buildFailedAction(
      'The earlier record this branch acts on was not found',
      AUTOMATION_ERROR_CODES.NOT_FOUND,
    );
  }

  const response = await sendCoreModuleProducer({
    subdomain,
    moduleName: 'automations',
    pluginName,
    producerName: TAutomationProducers.SET_PROPERTIES,
    input: {
      moduleName,
      triggerType,
      targetType,
      actionType: 'set-property',
      action,
      execution: target.execution,
      collectionType,
    },
  });

  // The owning plugin already marks every rule it applied, refused or dropped,
  // so the outcome is read from those rather than from the call returning.
  const changes: TAutomationSetPropertyChange[] = Array.isArray(
    response?.changes,
  )
    ? response.changes
    : [];

  if (changes.some(({ status }) => status === 'failed')) {
    return buildFailedAction(
      `Could not set ${module} properties`,
      AUTOMATION_ERROR_CODES.BUSINESS_ERROR,
      response,
    );
  }

  if (
    changes.length &&
    !changes.some(({ status }) => APPLIED_STATUSES.includes(status))
  ) {
    return buildSkippedAction('nothing-to-update', response);
  }

  return response;
};
