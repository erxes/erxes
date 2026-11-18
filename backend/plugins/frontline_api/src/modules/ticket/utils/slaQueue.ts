import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { TSlaCheck } from '@/ticket/utils/sla';

export const TICKET_SLA_QUEUE = 'ticketSla';

export type TTicketSlaPipelineJob = {
  subdomain: string;
  pipelineId: string;
};

export type TTicketSlaJob = {
  subdomain: string;
  ticketId: string;
  clock: TSlaCheck['clock'];
  phase: TSlaCheck['phase'];
  dueAt: string;
};

/**
 * One delayed job per warning and breach. The due time is in the job id, so a
 * moved due time arms a new job and the old one finds nothing to do.
 */
export const scheduleSlaChecks = async (
  subdomain: string,
  ticketId: string,
  checks: TSlaCheck[],
) => {
  for (const check of checks) {
    const data: TTicketSlaJob = {
      subdomain,
      ticketId,
      clock: check.clock,
      phase: check.phase,
      dueAt: check.dueAt.toISOString(),
    };

    await sendWorkerQueue('frontline', TICKET_SLA_QUEUE).add('check', data, {
      delay: Math.max(0, check.at.getTime() - Date.now()),
      jobId: `sla-${ticketId}-${check.clock}-${check.phase}-${check.dueAt.getTime()}`,
      removeOnComplete: true,
      removeOnFail: true,
    });
  }
};

/** Recomputes the SLA of a pipeline's open tickets after its policy changed. */
export const scheduleSlaPipelineResync = async (
  subdomain: string,
  pipelineId: string,
) => {
  const data: TTicketSlaPipelineJob = { subdomain, pipelineId };

  await sendWorkerQueue('frontline', TICKET_SLA_QUEUE).add('resyncPipeline', data, {
    removeOnComplete: true,
    removeOnFail: true,
  });
};
