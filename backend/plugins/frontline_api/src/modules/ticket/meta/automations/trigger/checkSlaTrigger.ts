import { ITicket } from '~/modules/ticket/@types/ticket';
import { TTicketSlaClock, TTicketSlaPhase } from '~/modules/ticket/@types/sla';
import { slaFlagOf } from '~/modules/ticket/utils/sla';

export const TICKET_SLA_RELATION = 'sla';

export const TICKET_SLA_EVENTS = [
  'firstResponse.warning',
  'firstResponse.breached',
  'resolution.warning',
  'resolution.breached',
] as const;

export type TTicketSlaEvent = (typeof TICKET_SLA_EVENTS)[number];

export type TTicketSlaTriggerConfig = {
  pipelineId?: string;
  // Empty means every warning and breach.
  events?: TTicketSlaEvent[];
};

type TEventUpdateDescription = {
  added?: Record<string, unknown>;
};

const readAdded = (added: Record<string, unknown> | undefined, flag: string) => {
  const nested = added?.sla as Record<string, unknown> | undefined;

  return nested?.[flag] ?? added?.[`sla.${flag}`];
};

/**
 * The SLA mark an update set, when it is one the trigger listens for. A mark
 * is written once, by the warning or breach check, so seeing it added is
 * seeing the event.
 */
export const matchTicketSlaEvent = ({
  target,
  config,
  eventUpdateDescription,
}: {
  target: Partial<Pick<ITicket, 'pipelineId'>>;
  config?: TTicketSlaTriggerConfig;
  eventUpdateDescription?: TEventUpdateDescription;
}): TTicketSlaEvent | undefined => {
  const { pipelineId, events = [] } = config || {};

  if (pipelineId && target.pipelineId !== pipelineId) {
    return undefined;
  }

  return TICKET_SLA_EVENTS.find((event) => {
    if (events.length && !events.includes(event)) {
      return false;
    }

    const [clock, phase] = event.split('.') as [TTicketSlaClock, TTicketSlaPhase];

    return !!readAdded(eventUpdateDescription?.added, slaFlagOf(clock, phase));
  });
};
