import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { Job } from 'bullmq';
import { generateModels } from '~/connectionResolvers';
import {
  TICKET_SLA_QUEUE,
  TTicketSlaJob,
  TTicketSlaPipelineJob,
} from '@/ticket/utils/slaQueue';
import { TICKET_STATUS_TYPES } from '@/ticket/constants/types';

const CLOSED_TYPES = [
  TICKET_STATUS_TYPES.RESOLVED,
  TICKET_STATUS_TYPES.CLOSED,
  TICKET_STATUS_TYPES.CANCELLED,
];

const resyncPipeline = async ({ subdomain, pipelineId }: TTicketSlaPipelineJob) => {
  const models = await generateModels(subdomain);
  const cursor = models.Ticket.find(
    { pipelineId, statusType: { $nin: CLOSED_TYPES } },
    { _id: 1 },
  )
    .lean()
    .cursor();

  for await (const ticket of cursor) {
    await models.Ticket.syncSla(String(ticket._id), subdomain);
  }
};

/** Trips SLA warnings and breaches when their time comes. */
export const startTicketSlaWorker = () =>
  createMQWorkerWithListeners(
    'frontline',
    TICKET_SLA_QUEUE,
    async (job: Job<TTicketSlaJob | TTicketSlaPipelineJob>) => {
      if (job.name === 'resyncPipeline') {
        await resyncPipeline(job.data as TTicketSlaPipelineJob);
        return;
      }

      const { subdomain, ticketId, clock, phase, dueAt } =
        (job.data || {}) as TTicketSlaJob;

      if (!subdomain || !ticketId || !clock || !phase || !dueAt) {
        console.error(`Ticket SLA job ${job.id} is missing its target`);
        return;
      }

      const models = await generateModels(subdomain);

      await models.Ticket.checkSlaDue({
        _id: ticketId,
        clock,
        phase,
        dueAt: new Date(dueAt),
      });
    },
    redis,
    () => undefined,
  );
