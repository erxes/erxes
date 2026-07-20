const sendWorkerQueue = jest.fn();
const executeActions = jest.fn();
const getActionsMap = jest.fn((actions: unknown) => {
  void actions;
  return { first: { id: 'first' } };
});

jest.mock('erxes-api-shared/utils', () => ({
  createMQWorkerWithListeners: jest.fn(),
  getEnv: jest.fn(),
  getSaasOrganizations: jest.fn(),
  sendWorkerQueue: (...args: unknown[]) => sendWorkerQueue(...args),
}));
jest.mock('erxes-api-shared/core-modules', () => ({
  AUTOMATION_CORE_TRIGGER_TYPES: { SCHEDULE: 'core:schedules.recurring' },
  AUTOMATION_EXECUTION_STATUS: { ACTIVE: 'active' },
}));

jest.mock('../connectionResolver', () => ({ generateModels: jest.fn() }));
jest.mock('../executions/executeActions', () => ({
  executeActions: (...args: unknown[]) => executeActions(...args),
}));
jest.mock('../utils/utils', () => ({
  getActionsMap: (actions: unknown) => getActionsMap(actions),
}));

import { AUTOMATION_CORE_TRIGGER_TYPES } from 'erxes-api-shared/core-modules';
import {
  executeScheduledAutomation,
  syncTenantAutomationSchedules,
} from './scheduleWorker';

const scheduleTrigger = {
  id: 'trigger-1',
  type: AUTOMATION_CORE_TRIGGER_TYPES.SCHEDULE,
  actionId: 'first',
  config: { cron: '0 9 * * 1-5', timezone: 'Asia/Ulaanbaatar' },
};

const automation = {
  _id: 'automation-1',
  status: 'active',
  triggers: [scheduleTrigger],
  actions: [{ id: 'first', type: 'sendEmail', config: {} }],
};

describe('Core Automation recurring schedules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('upserts active schedule triggers and removes stale tenant schedulers', async () => {
    const queue = {
      upsertJobScheduler: jest.fn(),
      getJobSchedulers: jest
        .fn()
        .mockResolvedValue([
          { key: 'automation:schedule:os:stale:trigger' },
          { key: 'automation:schedule:other:keep:trigger' },
        ]),
      removeJobScheduler: jest.fn(),
    };
    sendWorkerQueue.mockReturnValue(queue);
    const models = {
      Automations: {
        find: jest.fn(() => ({
          lean: jest.fn().mockResolvedValue([automation]),
        })),
      },
    };

    await syncTenantAutomationSchedules(models as never, 'os');

    expect(queue.upsertJobScheduler).toHaveBeenCalledWith(
      'automation:schedule:os:automation-1:trigger-1',
      { pattern: '0 9 * * 1-5', tz: 'Asia/Ulaanbaatar' },
      expect.objectContaining({
        name: 'execute-recurring-automation',
        data: {
          kind: 'execute',
          subdomain: 'os',
          automationId: 'automation-1',
          triggerId: 'trigger-1',
        },
      }),
    );
    expect(queue.removeJobScheduler).toHaveBeenCalledTimes(1);
    expect(queue.removeJobScheduler).toHaveBeenCalledWith(
      'automation:schedule:os:stale:trigger',
    );
  });

  it('creates a normal automation execution and continues from the trigger action', async () => {
    const execution = { _id: 'execution-1', status: 'active' };
    const models = {
      Executions: { create: jest.fn().mockResolvedValue(execution) },
    };
    const scheduledAt = new Date('2026-07-13T01:00:00.000Z');

    await expect(
      executeScheduledAutomation({
        models: models as never,
        subdomain: 'os',
        automation: automation as never,
        trigger: scheduleTrigger as never,
        scheduledAt,
      }),
    ).resolves.toBe(execution);

    expect(models.Executions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        automationId: 'automation-1',
        triggerId: 'trigger-1',
        targetId: 'trigger-1:2026-07-13T01:00:00.000Z',
        target: {
          _id: 'trigger-1:2026-07-13T01:00:00.000Z',
          scheduledAt: '2026-07-13T01:00:00.000Z',
          timezone: 'Asia/Ulaanbaatar',
        },
      }),
    );
    expect(executeActions).toHaveBeenCalledWith(
      'os',
      AUTOMATION_CORE_TRIGGER_TYPES.SCHEDULE,
      execution,
      { first: { id: 'first' } },
      'first',
    );
  });

  it('skips malformed cron expressions without blocking reconciliation', async () => {
    const queue = {
      upsertJobScheduler: jest.fn(),
      getJobSchedulers: jest.fn().mockResolvedValue([]),
      removeJobScheduler: jest.fn(),
    };
    sendWorkerQueue.mockReturnValue(queue);
    const models = {
      Automations: {
        find: jest.fn(() => ({
          lean: jest.fn().mockResolvedValue([
            {
              ...automation,
              triggers: [
                { ...scheduleTrigger, config: { cron: 'every morning' } },
              ],
            },
          ]),
        })),
      },
    };

    await expect(
      syncTenantAutomationSchedules(models as never, 'os'),
    ).resolves.toBeUndefined();
    expect(queue.upsertJobScheduler).not.toHaveBeenCalled();
    expect(queue.getJobSchedulers).toHaveBeenCalled();
  });
});
