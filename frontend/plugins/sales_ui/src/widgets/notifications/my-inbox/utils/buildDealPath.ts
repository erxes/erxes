import type { DealNavigationTarget } from '~/widgets/notifications/my-inbox/types/notificationContent';

export const buildDealPath = (deal: DealNavigationTarget) => {
  const searchParams = new URLSearchParams({ salesItemId: deal._id });
  if (deal.boardId) searchParams.set('boardId', deal.boardId);
  if (deal.pipeline?._id) searchParams.set('pipelineId', deal.pipeline._id);
  return `/sales/deals?${searchParams.toString()}`;
};
