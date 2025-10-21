import { generateModels } from '@/connectionResolver';
import { validateAgainstSchema } from '@/executions/actions/webhook/incoming/bodyValidator';
import {
  isTimestampValid,
  streamToBuffer,
  trySetIdempotency,
  verifyHmac,
} from '@/executions/actions/webhook/incoming/utils';
import { executeActions } from '@/executions/executeActions';
import { getActionsMap } from '@/utils';
import {
  AUTOMATION_EXECUTION_STATUS,
  AUTOMATION_STATUSES,
  AutomationExecutionSetWaitCondition,
  EXECUTE_WAIT_TYPES,
} from 'erxes-api-shared/core-modules';
import { getSubdomain, sendWorkerQueue } from 'erxes-api-shared/utils';
import { Request, Response } from 'express';

export const waitingWebhookExecutionHandler = async (
  req: Request,
  res: Response,
) => {
  const { executionId } = req.params;
  const restPath = req.params[0] || '';

  const subdomain = getSubdomain(req);

  // Basic header extraction
  const headerSig =
    req.get('x-webhook-signature') || req.get('x-hub-signature-256');
  const headerTs = req.get('x-webhook-timestamp');
  const idempotencyKey = (req.get('Idempotency-Key') ||
    req.get('X-Idempotency-Key')) as string | undefined;

  if (!isTimestampValid(headerTs, 300)) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or missing timestamp' });
  }
  const idempotencyRedisKey = `webhook:idemp:${executionId}:${
    idempotencyKey || req.ip
  }`;

  const idempOk = await trySetIdempotency(idempotencyRedisKey, 60 * 5); // 5min TTL
  if (!idempOk) {
    // Already processed/recently received
    return res
      .status(409)
      .json({ success: false, message: 'Duplicate request (idempotency)' });
  }

  if (!idempOk) {
    // Already processed/recently received
    return res
      .status(409)
      .json({ success: false, message: 'Duplicate request (idempotency)' });
  }
  // const secret =
  //   waitCondition?.endpointSecret || waitCondition?.security?.secret;

  // Quick checks
  if (!executionId) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing execution id' });
  }
  const models = await generateModels(subdomain);

  const execution = await models.Executions.findOne({
    _id: executionId,
  }).lean();

  if (!execution) {
    return res
      .status(404)
      .json({ success: false, message: 'Execution not found' });
  }

  if (execution.status !== AUTOMATION_EXECUTION_STATUS.WAITING) {
    // choose your own allowed statuses; fail safe
    return res
      .status(409)
      .json({ success: false, message: 'Execution not in waiting state' });
  }

  const automation = await models.Automations.findOne({
    _id: execution.automationId,
    status: AUTOMATION_STATUSES.ACTIVE,
  });

  if (!automation) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing automation' });
  }

  const endpoint = restPath.startsWith('/') ? restPath : `/${restPath}`;

  const waitingAction = await models.WaitingActions.findOne({
    conditionType: EXECUTE_WAIT_TYPES.WEBHOOK,
    executionId: executionId,
    automationId: execution.automationId,
    'conditionConfig.endpoint': endpoint,
  });

  if (!waitingAction) {
    // choose your own allowed statuses; fail safe
    return res.status(409).json({
      success: false,
      message: 'Execution already processed or claimed',
    });
  }

  const { secret, schema } = (waitingAction?.conditionConfig || {}) as Extract<
    AutomationExecutionSetWaitCondition,
    { type: EXECUTE_WAIT_TYPES.WEBHOOK }
  >;

  if (secret) {
    let raw: Buffer;

    if (req.body instanceof Buffer) {
      raw = req.body;
    } else {
      const rawBuffer = await streamToBuffer(req);
      raw = rawBuffer;
    }
    // If you used express.raw, req.body is the Buffer. If not, adapt accordingly.
    const ok = verifyHmac(raw, secret, headerSig);
    if (!ok) {
      // log and return 401
      sendWorkerQueue('logs', 'put_log').add('put_log', {
        subdomain,
        source: 'webhook',
        status: 'failed',
        payload: {
          type: 'webhook_security',
          message: 'HMAC signature mismatch',
          executionId,
          ip: req.ip,
          createdAt: new Date(),
        },
      });
      return res
        .status(401)
        .json({ success: false, message: 'Invalid signature' });
    }
  }

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

  const { actions = [] } = automation;

  const action = actions.find(
    ({ id }) => id === waitingAction.responseActionId,
  );

  executeActions(
    subdomain,
    execution.triggerType,
    execution,
    await getActionsMap(automation.actions || []),
    action?.nextActionId,
  );
  return res
    .status(200)
    .json({ success: true, message: 'Webhook accepted', executionId });
};
