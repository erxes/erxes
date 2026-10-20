import type { TeamEventMetadataProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { RelativeDateDisplay } from 'erxes-ui';
import { TeamActor } from '~/widgets/notifications/my-inbox/components/TeamActor';

export const TeamEventMetadata = ({
  action,
  createdAt,
  fromUser,
}: TeamEventMetadataProps) => (
  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
    <TeamActor user={fromUser} />
    {action ? <span>{action}</span> : null}
    {createdAt ? <RelativeDateDisplay.Value value={createdAt} /> : null}
  </div>
);
