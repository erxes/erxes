import { IconBrandDiscord, IconX } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { Link } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { DISCORD_ACCOUNT_PATH } from '../constants';
import { useDiscordMyAccount } from '../hooks/useDiscordAccount';
import { useDiscordConfigByTeam } from '../hooks/useDiscordIntegration';
import { discordLinkBannerDismissedState } from '../states/discordLinkBannerState';

export function DiscordLinkBanner({ teamId }: { teamId: string }) {
  const [dismissed, setDismissed] = useAtom(discordLinkBannerDismissedState);
  const { account } = useDiscordMyAccount();
  const { config } = useDiscordConfigByTeam(dismissed ? '' : teamId);

  if (
    dismissed ||
    !account?.linkingEnabled ||
    account.link ||
    !config?.isActive
  ) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-accent/50 px-4 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-2">
        <IconBrandDiscord className="size-4 shrink-0" />
        <span className="truncate">
          This team posts updates to Discord. Link your Discord account to be
          mentioned on your tasks.
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button size="sm" variant="secondary" asChild>
          <Link to={DISCORD_ACCOUNT_PATH}>Link account</Link>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
        >
          <IconX className="size-4" />
        </Button>
      </div>
    </div>
  );
}
