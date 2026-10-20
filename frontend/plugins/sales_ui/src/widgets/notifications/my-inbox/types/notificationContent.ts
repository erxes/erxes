import type { TNotification } from 'ui-modules';
import type { IDealDetail } from '@/deals/types/deals';

export type DealActorBadgeProps = Pick<TNotification, 'fromUser'>;

export type DealNotificationBodyProps = { deal: IDealDetail };

export type DealNotificationHeaderProps = Pick<
  TNotification,
  'action' | 'createdAt' | 'fromUser'
> & {
  deal: IDealDetail;
};

export type DealNavigationTarget = Pick<
  IDealDetail,
  '_id' | 'boardId' | 'pipeline'
>;
export type DealOpenButtonProps = { deal: DealNavigationTarget };

export type DealTitleBlockProps = {
  deal: Pick<IDealDetail, 'number' | 'name'>;
};

export type NotificationContentUnavailableProps = {
  title: string;
  description: string;
};

export type SalesDealDetailViewProps = Pick<
  TNotification,
  'action' | 'createdAt' | 'fromUser'
> & {
  deal: IDealDetail;
};

export type SalesDealNotificationContentProps = Pick<
  TNotification,
  'action' | 'createdAt' | 'contentTypeId' | 'fromUser'
>;
