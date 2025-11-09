import { generateModels } from '@/connectionResolver';
import { validateAgainstSchema } from '@/executions/actions/webhook/incoming/bodyValidator';
import { executeActions } from '@/executions/executeActions';
import { getActionsMap } from '@/utils/utils';
import {
  AUTOMATION_EXECUTION_STATUS,
  AUTOMATION_STATUSES,
  AutomationExecutionSetWaitCondition,
  EXECUTE_WAIT_TYPES,
} from 'erxes-api-shared/core-modules';
import { getSubdomain } from 'erxes-api-shared/utils';
import { Request, Response } from 'express';

export const waitingWebhookExecutionHandler = async (
  req: Request,
  res: Response,
) => {
  const { executionId, actionId } = req.params;
  const endpoint = req.params[0] || '';

  if (!executionId) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing executionId' });
  }

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  // const headerTs = req.get('x-webhook-timestamp');
  // if (!isTimestampValid(headerTs, 300)) {
  //   return res
  //     .status(401)
  //     .json({ success: false, message: 'Invalid or missing timestamp' });
  // }

  // const idempotencyKey =
  //   req.get('Idempotency-Key') || req.get('X-Idempotency-Key');
  // const idempotencyRedisKey = `webhook:idemp:${automationId}:${
  //   idempotencyKey || req.ip
  // }`;

  // const idempOk = await trySetIdempotency(idempotencyRedisKey, 60 * 5);
  // if (!idempOk) {
  //   return res
  //     .status(409)
  //     .json({ success: false, message: 'Duplicate request' });
  // }

  const execution = await models.Executions.findOne({
    _id: executionId,
    status: AUTOMATION_EXECUTION_STATUS.WAITING,
  });

  if (!execution) {
    return res.status(409).json({
      success: false,
      message: 'Execution already processed',
    });
  }

  const automation = await models.Automations.findOne({
    _id: execution.automationId,
    status: AUTOMATION_STATUSES.ACTIVE,
  }).lean();

  if (!automation) {
    return res
      .status(404)
      .json({ success: false, message: 'Automation not found' });
  }

  const waitingAction = await models.WaitingActions.findOne({
    conditionType: EXECUTE_WAIT_TYPES.WEBHOOK,
    automationId: execution.automationId,
    currentActionId: actionId,
    'conditionConfig.endpoint': endpoint,
  });

  if (!waitingAction) {
    return res.status(409).json({
      success: false,
      message: 'Execution already processed',
    });
  }

  const { secret, schema } = (waitingAction.conditionConfig || {}) as Extract<
    AutomationExecutionSetWaitCondition,
    { type: EXECUTE_WAIT_TYPES.WEBHOOK }
  >;

  // if (secret) {
  //   console.log('[waitingWebhookExecutionHandler] Starting HMAC verification');
  //   const headerSig =
  //     req.get('x-webhook-signature') || req.get('x-hub-signature-256');
  //   console.log('[waitingWebhookExecutionHandler] Header signature', {
  //     headerSig: headerSig ? 'present' : 'missing',
  //     bodyIsBuffer: req.body instanceof Buffer,
  //   });

  //   console.log('[waitingWebhookExecutionHandler] Getting raw body...');
  //   const raw =
  //     req.body instanceof Buffer ? req.body : await streamToBuffer(req);
  //   console.log('[waitingWebhookExecutionHandler] Raw body obtained', {
  //     rawLength: raw?.length,
  //   });

  //   console.log('[waitingWebhookExecutionHandler] Verifying HMAC...');
  //   const isValid = verifyHmac(raw, secret, headerSig);
  //   console.log('[waitingWebhookExecutionHandler] HMAC verification result', {
  //     isValid,
  //   });

  //   if (!isValid) {
  //     console.log(
  //       '[waitingWebhookExecutionHandler] HMAC invalid, logging and returning',
  //     );
  //     sendWorkerQueue('logs', 'put_log').add('put_log', {
  //       subdomain,
  //       source: 'webhook',
  //       status: 'failed',
  //       payload: {
  //         type: 'webhook_security',
  //         message: 'HMAC signature mismatch',
  //         executionId: execution._id,
  //         ip: req.ip,
  //         createdAt: new Date(),
  //       },
  //     });
  //     return res
  //       .status(401)
  //       .json({ success: false, message: 'Invalid signature' });
  //   }
  //   console.log('[waitingWebhookExecutionHandler] HMAC valid, continuing');
  // }

  if (schema) {
    const errors = validateAgainstSchema(schema, req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload',
        errors,
      });
    }
  }
  const actionsMap = await getActionsMap(automation.actions || []);

  const responseAction = actionsMap[waitingAction.responseActionId];

  if (!responseAction) {
    return res.status(409).json({
      success: false,
      message: 'Response action not found',
    });
  }

  await executeActions(
    subdomain,
    execution.triggerType,
    execution,
    actionsMap,
    responseAction?.id,
  );

  return res.status(200).json({
    success: true,
    message: 'Webhook accepted',
    executionId: execution._id,
  });
};
