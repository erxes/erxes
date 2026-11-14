import { z } from 'zod';

// Mirrors `TICKET_SLA_RELATION` and `TICKET_SLA_EVENTS` in frontline_api.
export const TICKET_SLA_RELATION = 'sla';

export const TICKET_SLA_EVENTS = [
  'firstResponse.warning',
  'firstResponse.breached',
  'resolution.warning',
  'resolution.breached',
] as const;

export type TTicketSlaEvent = (typeof TICKET_SLA_EVENTS)[number];

export const ticketSlaTriggerFormSchema = z.object({
  channelId: z.string().optional(),
  // Empty listens to every pipeline.
  pipelineId: z.string().optional(),
  // Empty runs on every warning and breach.
  events: z.array(z.enum(TICKET_SLA_EVENTS)),
});

export type TTicketSlaTriggerForm = z.infer<typeof ticketSlaTriggerFormSchema>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toText = (value: unknown) => (typeof value === 'string' ? value : '');

export const readTicketSlaTriggerConfig = (
  config: unknown,
): TTicketSlaTriggerForm => {
  const value = isRecord(config) ? config : {};

  return {
    channelId: toText(value.channelId) || undefined,
    pipelineId: toText(value.pipelineId) || undefined,
    events: Array.isArray(value.events)
      ? value.events.filter((event): event is TTicketSlaEvent =>
          (TICKET_SLA_EVENTS as readonly string[]).includes(String(event)),
        )
      : [],
  };
};
