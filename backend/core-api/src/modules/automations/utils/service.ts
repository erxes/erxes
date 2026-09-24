import { sendTRPCMessage, sendWorkerQueue } from 'erxes-api-shared/utils';

/**
 * Arms the delays an automation was holding while it was not active.
 *
 * A `play` job that fires against a paused automation returns without
 * resuming, so the execution keeps waiting with nothing left to wake it. The
 * automations service owns those executions, and this is how it is told they
 * can move again.
 */
export const resumeHeldExecutions = async (
  subdomain: string,
  automationId: string,
) => {
  try {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'automations',
      method: 'mutation',
      module: 'automations',
      action: 'resumeWaitingExecutions',
      input: { automationId },
    });
  } catch {
    // Nothing is lost by failing here: the executions stay held, and the next
    // activation asks again.
  }
};

// Best effort: the recurring scheduler reconciles again every 60 seconds.
export const requestScheduleReconcile = async (subdomain: string) => {
  try {
    await sendWorkerQueue('automations', 'schedule').add(
      'reconcile-recurring-automations',
      { kind: 'reconcile', subdomain },
      { removeOnComplete: 10, removeOnFail: 10 },
    );
  } catch {
    return;
  }
};
