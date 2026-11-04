import { useCallback } from 'react';
import { IconBrandDiscord } from '@tabler/icons-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import {
  useDiscordAccountLinkPopup,
  useDiscordMyAccount,
  useUnlinkMyDiscordAccount,
} from '../hooks/useDiscordAccount';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export function MyDiscordAccountCard() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { account, loading, error } = useDiscordMyAccount();
  const link = account?.link;

  const handleLinked = useCallback(
    (message: string) =>
      toast({ title: 'Discord account linked', description: message }),
    [toast],
  );
  const handleLinkError = useCallback(
    (message: string) =>
      toast({
        title: 'Could not link the Discord account',
        description: message,
        variant: 'destructive',
      }),
    [toast],
  );

  const { openAccountLink, starting } = useDiscordAccountLinkPopup({
    onLinked: handleLinked,
    onError: handleLinkError,
  });

  const { unlinkMyAccount, unlinking } = useUnlinkMyDiscordAccount({
    onCompleted: () => toast({ title: 'Discord account unlinked' }),
    onError: (unlinkError) =>
      toast({
        title: 'Could not unlink the Discord account',
        description: unlinkError.message,
        variant: 'destructive',
      }),
  });

  function handleUnlink() {
    confirm({
      message:
        'Unlink your Discord account? The bot will stop mentioning you on your tasks.',
    }).then(() => {
      unlinkMyAccount();
    });
  }

  function renderDescription() {
    if (loading && !account) {
      return 'Loading your Discord account…';
    }
    if (error) {
      return (
        <span className="text-destructive">
          Failed to load your Discord account. Please refresh.
        </span>
      );
    }
    if (link) {
      return (
        <span className="flex min-w-0 items-center gap-1.5">
          <Avatar>
            <Avatar.Image
              src={link.avatarUrl ?? undefined}
              alt={link.username}
            />
            <Avatar.Fallback>{link.username[0]?.toUpperCase()}</Avatar.Fallback>
          </Avatar>
          <span className="truncate">
            {link.globalName || link.username} · @{link.username}
            {link.linkedAt ? ` · Linked ${formatDate(link.linkedAt)}` : ''}
          </span>
        </span>
      );
    }
    if (account?.linkingEnabled) {
      return 'Link it so the bot mentions you when a task is assigned to you.';
    }
    return 'Linking is off. An admin can turn it on under Member linking on a connected server.';
  }

  return (
    <Card>
      <Card.Content className="flex items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-muted-foreground">
            <IconBrandDiscord className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Discord account</span>
              {link ? <Badge variant="success">Linked</Badge> : null}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {renderDescription()}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {loading && !account ? <Spinner size="sm" /> : null}
          {link && account?.linkingEnabled ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={openAccountLink}
              disabled={starting}
            >
              Change
            </Button>
          ) : null}
          {link ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleUnlink}
              disabled={unlinking}
            >
              {unlinking ? <Spinner size="sm" /> : 'Unlink'}
            </Button>
          ) : null}
          {!link && !error && account?.linkingEnabled ? (
            <Button size="sm" onClick={openAccountLink} disabled={starting}>
              {starting ? <Spinner size="sm" /> : 'Connect Discord'}
            </Button>
          ) : null}
        </div>
      </Card.Content>
    </Card>
  );
}
