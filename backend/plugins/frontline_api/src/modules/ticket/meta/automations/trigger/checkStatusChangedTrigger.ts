import { ITicket } from '~/modules/ticket/@types/ticket';

export const TICKET_STATUS_CHANGED_RELATION = 'statusChanged';

export type TTicketStatusChangedTriggerConfig = {
  pipelineId?: string;
  // Empty means any status of the pipeline.
  toStatusIds?: string[];
};

type TEventUpdateDescription = {
  updated?: Record<string, { prev?: unknown; current?: unknown }>;
};

// Only an update that moved the status counts; a new ticket has no previous one.
export const isTicketStatusChanged = ({
  target,
  config,
  eventUpdateDescription,
}: {
  target: Partial<Pick<ITicket, 'pipelineId'>>;
  config?: TTicketStatusChangedTriggerConfig;
  eventUpdateDescription?: TEventUpdateDescription;
}) => {
  const { pipelineId, toStatusIds = [] } = config || {};
  const change = eventUpdateDescription?.updated?.statusId;

  if (!change || change.prev === change.current) {
    return false;
  }

  if (pipelineId && target.pipelineId !== pipelineId) {
    return false;
  }

  return (
    !toStatusIds.length || toStatusIds.includes(String(change.current))
  );
};
