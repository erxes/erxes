import {
  APPROVAL_DEFAULT_TIMEOUT_HOURS,
  APPROVAL_MAX_TIMEOUT_HOURS,
  AUTOMATION_ERROR_CODES,
  AUTOMATION_EXECUTION_STATUS,
  IAutomationAction,
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
  TApprovalActionConfig,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage, sendWorkerQueue } from 'erxes-api-shared/utils';
import { generateModels } from '../../connectionResolver';
import { AutomationActionError } from '../errorCodes';

export const APPROVAL_STEP_CHANGE_TYPE = 'core:automations.approvalStep';
export const APPROVAL_CONTENT_TYPE = 'core:automations.executions';

const toIds = (value: unknown): string[] => [
  ...new Set(
    (Array.isArray(value) ? value : String(value ?? '').split(','))
      .map((id) => String(id ?? '').trim())
      .filter(Boolean),
  ),
];

/** Hours to wait for a decision: the configured value, else the default. */
export const readApprovalTimeoutHours = (value: unknown) => {
  const hours = Number(value);

  if (
    value === undefined ||
    value === null ||
    value === '' ||
    !Number.isFinite(hours) ||
    hours <= 0
  ) {
    return APPROVAL_DEFAULT_TIMEOUT_HOURS;
  }

  return Math.min(hours, APPROVAL_MAX_TIMEOUT_HOURS);
};

/**
 * Asks team members to approve, in the automation owner's name, and parks the
 * run until a decision arrives (`resolveApprovalAction`). The wait has its own
 * clock: when it runs out the request is cancelled and the run takes the
 * rejected branch as `expired`.
 */
export const executeApprovalAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction<TApprovalActionConfig>,
) => {
  const config = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: (action.config || {}) as Record<string, unknown>,
    defaultValue: '',
  });

  const approverIds = toIds(config.approverIds);
  const summary = String(config.summary || '').trim();

  if (!approverIds.length || !summary) {
    throw new AutomationActionError(
      'An approval step needs approvers and a summary',
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

  const models = await generateModels(subdomain);
  const automation = await models.Automations.findOne(
    { _id: execution.automationId },
    { ownerId: 1, createdBy: 1 },
  ).lean<{ ownerId?: string; createdBy?: string } | null>();
  const requesterId =
    execution.createdVia?.actorId || automation?.ownerId || automation?.createdBy;

  if (!requesterId) {
    throw new AutomationActionError(
      'The automation has no owner to ask for approval in the name of',
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

  const request = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'approval',
    action: 'createAutomationRequest',
    input: {
      contentType: APPROVAL_CONTENT_TYPE,
      contentId: execution._id,
      requesterId,
      approverIds,
      change: {
        changeType: APPROVAL_STEP_CHANGE_TYPE,
        payload: { executionId: execution._id, actionId: action.id },
        summary,
      },
    },
    defaultValue: null,
  });

  if (!request?._id) {
    throw new AutomationActionError(
      'The approval request could not be created',
      AUTOMATION_ERROR_CODES.PLUGIN_ACTION_FAILED,
    );
  }

  const timeoutHours = readApprovalTimeoutHours(config.timeoutHours);
  const expiresAt = new Date(Date.now() + timeoutHours * 3600_000);

  execution.waitingActionId = action.id;
  execution.startWaitingDate = new Date();
  execution.status = AUTOMATION_EXECUTION_STATUS.WAITING;

  await sendWorkerQueue('automations', 'action').add(
    'expireApproval',
    {
      subdomain,
      data: { executionId: execution._id, actionId: action.id },
    },
    {
      delay: Math.max(0, expiresAt.getTime() - Date.now()),
      // One clock per waiting step, however often this is called.
      jobId: `approval-expire-${execution._id}-${action.id}-${request._id}`,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );

  return {
    requestId: request._id,
    summary,
    approverIds,
    expiresAt: expiresAt.toISOString(),
    decision: 'pending',
  };
};
