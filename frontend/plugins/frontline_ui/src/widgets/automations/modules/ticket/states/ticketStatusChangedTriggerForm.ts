import { z } from 'zod';

// Mirrors `TICKET_STATUS_CHANGED_RELATION` in frontline_api.
export const TICKET_STATUS_CHANGED_RELATION = 'statusChanged';
export const TICKET_STATUS_CHANGED_TRIGGER_TYPE = `frontline:tickets.tickets.${TICKET_STATUS_CHANGED_RELATION}`;

export const ticketStatusChangedTriggerFormSchema = z.object({
  channelId: z.string().optional(),
  pipelineId: z.string().min(1, 'Select a pipeline'),
  // Empty runs on a move to any status of the pipeline.
  toStatusIds: z.array(z.string()),
});

export type TTicketStatusChangedTriggerForm = z.infer<
  typeof ticketStatusChangedTriggerFormSchema
>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toText = (value: unknown) => (typeof value === 'string' ? value : '');

export const readTicketStatusChangedTriggerConfig = (
  config: unknown,
): TTicketStatusChangedTriggerForm => {
  const value = isRecord(config) ? config : {};

  return {
    channelId: toText(value.channelId) || undefined,
    pipelineId: toText(value.pipelineId),
    toStatusIds: Array.isArray(value.toStatusIds)
      ? value.toStatusIds.filter(
          (statusId): statusId is string => typeof statusId === 'string',
        )
      : [],
  };
};
