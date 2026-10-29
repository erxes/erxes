import { useCallback } from 'react';
import { IconBrandDiscord } from '@tabler/icons-react';
import {
  Alert,
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

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <IconBrandDiscord className="size-5" />
          <Card.Title>Discord account</Card.Title>
        </div>
        <Card.Description>
          When a task is assigned to you, the bot mentions this account in the
          team’s Discord channel.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        {loading && !account ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            Failed to load your Discord account. Please refresh.
          </Alert>
        ) : link ? (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar size="xl">
                <Avatar.Image
                  src={link.avatarUrl ?? undefined}
                  alt={link.username}
                />
                <Avatar.Fallback>
                  {link.username[0]?.toUpperCase()}
                </Avatar.Fallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">
                    {link.globalName || link.username}
                  </span>
                  <Badge variant="success">Linked</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  @{link.username}
                  {link.linkedAt
                    ? ` · Linked ${formatDate(link.linkedAt)}`
                    : ''}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {account?.linkingEnabled ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={openAccountLink}
                  disabled={starting}
                >
                  Change
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="destructive"
                onClick={handleUnlink}
                disabled={unlinking}
              >
                {unlinking ? <Spinner size="sm" /> : 'Unlink'}
              </Button>
            </div>
          </div>
        ) : account?.linkingEnabled ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <IconBrandDiscord className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No Discord account linked</p>
              <p className="text-sm text-muted-foreground">
                Sign in with Discord to confirm which account is yours.
              </p>
            </div>
            <Button onClick={openAccountLink} disabled={starting}>
              {starting ? <Spinner size="sm" /> : 'Connect Discord'}
            </Button>
          </div>
        ) : (
          <Alert>
            Discord account linking is off. An admin can turn it on under Member
            linking on a connected Discord server.
          </Alert>
        )}
      </Card.Content>
    </Card>
  );
}
