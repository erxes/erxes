import type { SalesDealDetailViewProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { DealNotificationHeader } from '~/widgets/notifications/my-inbox/components/DealNotificationHeader';
import { DealNotificationBody } from '~/widgets/notifications/my-inbox/components/DealNotificationBody';

export const SalesDealDetailView = ({
  action,
  createdAt,
  deal,
  fromUser,
}: SalesDealDetailViewProps) => (
  <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6">
    <DealNotificationHeader
      action={action}
      createdAt={createdAt}
      deal={deal}
      fromUser={fromUser}
    />
    <DealNotificationBody deal={deal} />
  </div>
);
