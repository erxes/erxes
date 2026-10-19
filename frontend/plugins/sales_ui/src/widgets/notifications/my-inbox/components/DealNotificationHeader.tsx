import type { DealNotificationHeaderProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { RelativeDateDisplay } from 'erxes-ui';
import { DealActorBadge } from '~/widgets/notifications/my-inbox/components/DealActorBadge';
import { DealTitleBlock } from '~/widgets/notifications/my-inbox/components/DealTitleBlock';
import { DealOpenButton } from '~/widgets/notifications/my-inbox/components/DealOpenButton';

export const DealNotificationHeader = ({
  action,
  createdAt,
  deal,
  fromUser,
}: DealNotificationHeaderProps) => (
  <header className="border-b py-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <DealTitleBlock deal={deal} />
      <DealOpenButton deal={deal} />
    </div>
    <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm text-muted-foreground">
      <DealActorBadge fromUser={fromUser} />
      {action && <span>{action}</span>}
      {createdAt && <RelativeDateDisplay.Value value={createdAt} />}
    </div>
  </header>
);
