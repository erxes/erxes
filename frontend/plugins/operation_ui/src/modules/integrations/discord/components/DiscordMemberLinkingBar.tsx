import { useState } from 'react';
import { IconUserCheck } from '@tabler/icons-react';
import { Badge, Button, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useSetDiscordMemberLinking } from '../hooks/useDiscordAccount';
import { IDiscordConnection } from '../types';
import { DiscordMemberLinkingSheet } from './DiscordMemberLinkingSheet';

type TMemberLinkingState = 'on' | 'paused' | 'off';

const STATE_BADGE = {
  on: { label: 'On', variant: 'success' },
  paused: { label: 'Off', variant: 'secondary' },
  off: { label: 'Off', variant: 'secondary' },
} as const;

const describeState = (state: TMemberLinkingState, botUsername?: string) => {
  if (state === 'on') {
    return `Members link their Discord account in My account through ${botUsername}. Set once for the whole workspace.`;
  }

  if (state === 'paused') {
    return `Turned off. The setup for ${botUsername} is kept, so you can turn it back on without setting it up again.`;
  }

  return 'Lets the bot mention task assignees. Set it up once for the whole workspace.';
};

export function DiscordMemberLinkingBar({
  connections,
}: Readonly<{ connections: IDiscordConnection[] }>) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [sheetOpen, setSheetOpen] = useState(false);
  const saved = connections.filter((connection) => connection.hasClientSecret);
  const active = saved.filter((connection) => !connection.memberLinkingPaused);
  const paused = saved.find((connection) => connection.memberLinkingPaused);
  let state: TMemberLinkingState = 'off';

  if (active.length) {
    state = 'on';
  } else if (paused) {
    state = 'paused';
  }

  const bot = active[0] ?? paused;

  const { setMemberLinking, switching } = useSetDiscordMemberLinking({
    onCompleted: ({ operationDiscordSetMemberLinking: result }) =>
      toast({
        title: result?.memberLinkingPaused
          ? 'Member linking turned off'
          : 'Member linking turned on',
      }),
    onError: (error) =>
      toast({
        title: 'Could not change member linking',
        description: error.message,
        variant: 'destructive',
      }),
  });

  function handleTurnOff() {
    confirm({
      message:
        'Turn off member linking? Linked accounts keep getting mentions, but nobody can link a new account until you turn it back on. The setup is kept.',
    }).then(() => {
      active.forEach((connection) =>
        setMemberLinking({
          variables: { _id: connection._id, enabled: false },
        }),
      );
    });
  }

  function handleTurnOn() {
    if (paused) {
      setMemberLinking({ variables: { _id: paused._id, enabled: true } });
    }
  }

  function renderActions() {
    if (state === 'on') {
      return (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleTurnOff}
          disabled={switching}
        >
          {switching ? <Spinner size="sm" /> : 'Turn off'}
        </Button>
      );
    }

    if (state === 'paused') {
      return (
        <>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSheetOpen(true)}
            disabled={switching}
          >
            Set up again
          </Button>
          <Button size="sm" onClick={handleTurnOn} disabled={switching}>
            {switching ? <Spinner size="sm" /> : 'Turn on'}
          </Button>
        </>
      );
    }

    return (
      <Button size="sm" onClick={() => setSheetOpen(true)}>
        Set up
      </Button>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-muted-foreground">
            <IconUserCheck className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Member linking</span>
              <Badge variant={STATE_BADGE[state].variant}>
                {STATE_BADGE[state].label}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {describeState(state, bot?.botUsername)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {renderActions()}
        </div>
      </div>

      <DiscordMemberLinkingSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        connections={connections}
        defaultConnectionId={paused?._id}
      />
    </>
  );
}
