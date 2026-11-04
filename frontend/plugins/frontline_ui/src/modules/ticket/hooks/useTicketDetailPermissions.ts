import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { useGetTicketStatusById } from '@/status/hooks/useGetTicketStatus';
import {
  type ITicketPermissions,
  useTicketPermissions,
} from '@/ticket/hooks/useTicketPermissions';
import type { ITicketDetail } from '@/ticket/types';

/** Keeps ticket editing disabled until its pipeline and status permissions are ready. */
export const useTicketDetailPermissions = (
  ticket: Pick<ITicketDetail, 'pipelineId' | 'statusId' | 'assigneeId'>,
): Pick<ITicketPermissions, 'canEditTicket' | 'canMoveTicket'> => {
  const pipelineQuery = useGetPipeline(ticket.pipelineId ?? undefined);
  const statusQuery = useGetTicketStatusById(ticket.statusId ?? undefined);
  const { status } = statusQuery;
  const permissions = useTicketPermissions({
    pipeline: pipelineQuery.pipeline,
    assigneeId: ticket.assigneeId ?? undefined,
    status: status
      ? {
          value: status._id,
          memberIds: status.memberIds,
          canMoveMemberIds: status.canMoveMemberIds,
          canEditMemberIds: status.canEditMemberIds,
          visibilityType: status.visibilityType,
        }
      : undefined,
  });
  const ready = Boolean(
    pipelineQuery.pipeline &&
      !pipelineQuery.loading &&
      !pipelineQuery.error &&
      !statusQuery.loading &&
      !statusQuery.error &&
      (!ticket.statusId || status),
  );

  return {
    canEditTicket: ready && permissions.canEditTicket,
    canMoveTicket: ready && permissions.canMoveTicket,
  };
};
