import { generateModels } from '@/connectionResolver';
import { validateAgainstSchema } from '@/executions/actions/webhook/incoming/bodyValidator';
import { validateSecurity } from '@/executions/actions/webhook/incoming/utils';
import { executeActions } from '@/executions/executeActions';
import { getActionsMap } from '@/utils';
import {
  AUTOMATION_CORE_TRIGGER_TYPES,
  AUTOMATION_EXECUTION_STATUS,
} from 'erxes-api-shared/core-modules';
import { ILogDoc } from 'erxes-api-shared/core-types';
import { getSubdomain, sendWorkerQueue } from 'erxes-api-shared/utils';
import { Request, Response } from 'express';

export const incomingWebhookHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const restPath = req.params[0] || '';

  // Security headers for webhook responses
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const endpoint = restPath.startsWith('/') ? restPath : `/${restPath}`;

    // Find automation with proper indexing consideration
    const automation = await models.Automations.findOne({
      _id: id,
      status: 'active', // Only active automations
      triggers: {
        $elemMatch: {
          type: AUTOMATION_CORE_TRIGGER_TYPES.INCOMING_WEBHOOK,
          'config.endpoint': endpoint,
          'config.method': req.method,
        },
      },
    })
      .select('_id triggers actions status')
      .lean();

    if (!automation) {
      // Log security event (failed webhook attempt)
      sendWorkerQueue('logs', 'put_log').add('put_log', {
        subdomain,
        source: 'webhook',
        status: 'failed',
        payload: {
          type: 'webhook_security',
          message: `Failed webhook attempt - Automation not found`,
          webhookId: id,
          endpoint,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        },
      } as ILogDoc);

      return res.status(404).json({
        success: false,
        message: 'Webhook not found',
      });
    }

    const trigger = automation.triggers.find(
      ({ type, config }) =>
        type === AUTOMATION_CORE_TRIGGER_TYPES.INCOMING_WEBHOOK &&
        config?.endpoint === endpoint &&
        config?.method === req.method,
    );

    if (!trigger) {
      return res.status(404).json({
        success: false,
        message: 'Trigger not found',
      });
    }

    // Enhanced security validation
    try {
      await validateSecurity(req, trigger.config);
    } catch (securityError) {
      // Log security violation
      sendWorkerQueue('logs', 'put_log').add('put_log', {
        subdomain,
        source: 'webhook',
        status: 'failed',
        payload: {
          type: 'webhook_security',
          message: `Security validation failed: ${securityError.message}`,
          webhookId: id,
          endpoint,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          createdAt: new Date(),
        },
      } as ILogDoc);

      return res.status(401).json({
        success: false,
        message: 'Security validation failed',
      });
    }

    // Schema validation
    const { schema } = trigger.config || {};
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

    // Create execution with security context
    const execution = await models.Executions.create({
      automationId: automation._id,
      triggerId: trigger.id,
      triggerType: trigger.type,
      triggerConfig: {
        ...trigger.config,
        security: undefined, // Remove secret from logs
      },
      target: {
        // Webhook data
        body: req.body,
        query: req.query,
        headers: {
          // Only log non-sensitive headers
          'user-agent': req.get('User-Agent'),
          'content-type': req.get('Content-Type'),
        },
        method: req.method,
        endpoint: endpoint,

        // Security context
        security: {
          ip: req.ip,
          timestamp: new Date(),
          validated: true,
        },

        // Identifiers
        webhookId: id,
        automationId: automation._id,
        triggerId: trigger.id,
      },
      status: AUTOMATION_EXECUTION_STATUS.ACTIVE,
      description: `Secure webhook received from ${req.ip}`,
      createdAt: new Date(),
    });

    // Execute actions asynchronously to prevent timeout issues
    executeActions(
      subdomain,
      trigger.type,
      execution,
      await getActionsMap(automation.actions),
      trigger.actionId,
    ).catch(async (error) => {
      // Log execution errors but don't expose to client
      console.error('Webhook action execution failed:', error);
      sendWorkerQueue('logs', 'put_log').add('put_log', {
        subdomain,
        source: 'webhook',
        status: 'failed',
        payload: {
          type: 'webhook_execution_error',
          message: 'Action execution failed',
          data: {
            executionId: execution._id,
            automationId: automation._id,
            error: error.message,
          },
          createdAt: new Date(),
        },
      } as ILogDoc);
    });

    // Success response (no sensitive data)
    return res.json({
      success: true,
      message: 'Webhook processed successfully',
      executionId: execution._id,
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Enterprise webhook error:', error);

    // Generic error message to avoid information leakage
    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};
