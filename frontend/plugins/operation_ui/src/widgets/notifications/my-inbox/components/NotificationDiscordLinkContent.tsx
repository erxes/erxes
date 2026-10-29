import type { NotificationTeamContentProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { IconBrandDiscord } from '@tabler/icons-react';
import { DISCORD_ACCOUNT_PATH } from '@/integrations/discord/constants';
import { NotificationOpenButton } from '~/widgets/notifications/my-inbox/components/NotificationOpenButton';
import { TeamEventMetadata } from '~/widgets/notifications/my-inbox/components/TeamEventMetadata';

export const NotificationDiscordLinkContent = ({
  action,
  createdAt,
  fromUser,
  message,
}: NotificationTeamContentProps) => (
  <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 py-8">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
          <IconBrandDiscord className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Discord
          </p>
          <h2 className="mt-1 break-words text-2xl font-semibold text-foreground">
            {message || 'Link your Discord account'}
          </h2>
          <TeamEventMetadata
            action={action}
            createdAt={createdAt}
            fromUser={fromUser}
          />
        </div>
      </div>
      <NotificationOpenButton to={DISCORD_ACCOUNT_PATH}>
        Link Discord account
      </NotificationOpenButton>
    </header>
    <p className="py-6 text-sm text-muted-foreground">
      Once your account is linked, the bot mentions you in your team’s Discord
      channel when a task is assigned to you.
    </p>
  </div>
);
