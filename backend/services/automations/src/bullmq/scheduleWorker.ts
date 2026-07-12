import type { Job } from 'bullmq';
import type { Redis } from 'ioredis';
import {
  AUTOMATION_CORE_TRIGGER_TYPES,
  AUTOMATION_EXECUTION_STATUS,
  type IAutomationDocument,
  type IAutomationTrigger,
} from 'erxes-api-shared/core-modules';
import {
  createMQWorkerWithListeners,
  getEnv,
  getSaasOrganizations,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { generateModels, type IModels } from '../connectionResolver';
import { debugError } from '../debugger';
import { executeActions } from '../executions/executeActions';
import { getActionsMap } from '../utils/utils';

const SCHEDULE_QUEUE = 'schedule';
const RECONCILE_SCHEDULER_ID = 'automation:schedules:reconcile';
const AUTOMATION_SCHEDULER_PREFIX = 'automation:schedule:';
const RECONCILE_INTERVAL_MS = 60_000;

type ScheduleJobData =
  | { kind: 'reconcile'; subdomain?: string }
  | {
      kind: 'execute';
      subdomain: string;
      automationId: string;
      triggerId: string;
    };

interface ScheduleConfig {
  cron?: string;
  timezone?: string;
}

const schedulerId = (
  subdomain: string,
  automationId: string,
  triggerId: string,
) => `${AUTOMATION_SCHEDULER_PREFIX}${subdomain}:${automationId}:${triggerId}`;

const validateScheduleConfig = (config: ScheduleConfig) => {
  const cron = config.cron?.trim();
  const fields = cron?.split(/\s+/) ?? [];
  if (!cron || fields.length < 5 || fields.length > 7) {
    throw new Error(
      'Recurring schedules require a 5, 6, or 7 field cron expression',
    );
  }

  const timezone = config.timezone?.trim() || 'UTC';
  new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();

  return { cron, timezone };
};

const scheduleTriggers = (automation: IAutomationDocument) =>
  automation.triggers.filter(
    (trigger) => trigger.type === AUTOMATION_CORE_TRIGGER_TYPES.SCHEDULE,
  );

export const executeScheduledAutomation = async ({
  models,
  subdomain,
  automation,
  trigger,
  scheduledAt,
}: {
  models: IModels;
  subdomain: string;
  automation: IAutomationDocument;
  trigger: IAutomationTrigger;
  scheduledAt: Date;
}) => {
  const timezone = trigger.config?.timezone || 'UTC';
  const targetId = `${trigger.id}:${scheduledAt.toISOString()}`;
  const target = {
    _id: targetId,
    scheduledAt: scheduledAt.toISOString(),
    timezone,
  };

  const execution = await models.Executions.create({
    automationId: automation._id,
    triggerId: trigger.id,
    triggerType: trigger.type,
    triggerConfig: trigger.config,
    targetId,
    target,
    status: AUTOMATION_EXECUTION_STATUS.ACTIVE,
    description: 'Recurring schedule fired',
    createdAt: scheduledAt,
  });

  await executeActions(
    subdomain,
    trigger.type,
    execution,
    await getActionsMap(automation.actions),
    trigger.actionId,
  );

  return execution;
};

export const syncTenantAutomationSchedules = async (
  models: IModels,
  subdomain: string,
) => {
  const queue = sendWorkerQueue('automations', SCHEDULE_QUEUE);
  const automations = await models.Automations.find({
    status: 'active',
    'triggers.type': AUTOMATION_CORE_TRIGGER_TYPES.SCHEDULE,
  }).lean();
  const desiredIds = new Set<string>();

  for (const automation of automations) {
    for (const trigger of scheduleTriggers(automation)) {
      try {
        const { cron, timezone } = validateScheduleConfig(trigger.config || {});
        const id = schedulerId(subdomain, automation._id, trigger.id);
        desiredIds.add(id);
        await queue.upsertJobScheduler(
          id,
          { pattern: cron, tz: timezone },
          {
            name: 'execute-recurring-automation',
            data: {
              kind: 'execute',
              subdomain,
              automationId: automation._id,
              triggerId: trigger.id,
            } satisfies ScheduleJobData,
            opts: {
              removeOnComplete: 100,
              removeOnFail: 100,
            },
          },
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        debugError(
          `Skipping invalid schedule ${subdomain}/${automation._id}/${trigger.id}: ${message}`,
        );
      }
    }
  }

  const existing = await queue.getJobSchedulers(0, -1, true);
  for (const row of existing) {
    if (
      row.key.startsWith(`${AUTOMATION_SCHEDULER_PREFIX}${subdomain}:`) &&
      !desiredIds.has(row.key)
    ) {
      await queue.removeJobScheduler(row.key);
    }
  }
};

const tenants = async (): Promise<string[]> => {
  if (getEnv({ name: 'VERSION' }) === 'saas') {
    const organizations = await getSaasOrganizations();
    return organizations.map(
      (organization: { subdomain: string }) => organization.subdomain,
    );
  }
  return ['os'];
};

export const syncAllAutomationSchedules = async () => {
  for (const subdomain of await tenants()) {
    const models = await generateModels(subdomain);
    await syncTenantAutomationSchedules(models, subdomain);
  }
};

const processScheduleJob = async (job: Job<ScheduleJobData>) => {
  if (job.data.kind === 'reconcile') {
    if (job.data.subdomain) {
      const models = await generateModels(job.data.subdomain);
      await syncTenantAutomationSchedules(models, job.data.subdomain);
    } else {
      await syncAllAutomationSchedules();
    }
    return { status: 'reconciled' };
  }

  const { subdomain, automationId, triggerId } = job.data;
  const models = await generateModels(subdomain);
  const automation = await models.Automations.findOne({
    _id: automationId,
    status: 'active',
  });
  const trigger = automation?.triggers.find(
    (candidate) =>
      candidate.id === triggerId &&
      candidate.type === AUTOMATION_CORE_TRIGGER_TYPES.SCHEDULE,
  );

  if (!automation || !trigger) {
    return { status: 'skipped' };
  }

  const execution = await executeScheduledAutomation({
    models,
    subdomain,
    automation,
    trigger,
    scheduledAt: new Date(job.timestamp || Date.now()),
  });
  return { status: execution.status, executionId: execution._id };
};

export const initScheduleWorker = async (redis: Redis) => {
  await new Promise<void>((resolve) => {
    createMQWorkerWithListeners(
      'automations',
      SCHEDULE_QUEUE,
      processScheduleJob,
      redis,
      resolve,
    );
  });

  const queue = sendWorkerQueue('automations', SCHEDULE_QUEUE);
  await queue.upsertJobScheduler(
    RECONCILE_SCHEDULER_ID,
    { every: RECONCILE_INTERVAL_MS },
    {
      name: 'reconcile-recurring-automations',
      data: { kind: 'reconcile' } satisfies ScheduleJobData,
      opts: { removeOnComplete: 10, removeOnFail: 10 },
    },
  );
  await syncAllAutomationSchedules();
};
