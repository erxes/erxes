import {
  Alert,
  Badge,
  Button,
  Card,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { MembersInline } from 'ui-modules';
import {
  useDiscordMyAccount,
  useDiscordTeamMembers,
  useRemindDiscordMember,
  useUnlinkDiscordMember,
} from '../hooks/useDiscordAccount';
import { IDiscordTeamMember } from '../types';

function MemberLinkBadge({ member }: { member: IDiscordTeamMember }) {
  if (!member.link) {
    return <Badge variant="secondary">Not linked</Badge>;
  }

  if (member.inServer === true) {
    return <Badge variant="success">In server</Badge>;
  }

  if (member.inServer === false) {
    return <Badge variant="warning">Not in server</Badge>;
  }

  return <Badge variant="secondary">Linked</Badge>;
}

export function TeamDiscordMembers({ teamId }: { teamId: string }) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { members, loading, error } = useDiscordTeamMembers(teamId);
  const { account } = useDiscordMyAccount();
  const linkingEnabled = Boolean(account?.linkingEnabled);
  const linkedCount = members.filter((member) => member.link).length;

  const { remindMember, reminding } = useRemindDiscordMember({
    onCompleted: () => toast({ title: 'Reminder sent' }),
    onError: (remindError) =>
      toast({
        title: 'Could not send the reminder',
        description: remindError.message,
        variant: 'destructive',
      }),
  });

  const { unlinkMember, unlinking } = useUnlinkDiscordMember(teamId, {
    onCompleted: () => toast({ title: 'Discord account unlinked' }),
    onError: (unlinkError) =>
      toast({
        title: 'Could not unlink the Discord account',
        description: unlinkError.message,
        variant: 'destructive',
      }),
  });

  function handleUnlink(member: IDiscordTeamMember) {
    confirm({
      message: `Unlink @${
        member.link?.username ?? ''
      }? The bot stops mentioning this member until they link again.`,
    }).then(() => {
      unlinkMember({ variables: { userId: member.userId } });
    });
  }

  return (
    <Card className="mt-6">
      <Card.Header>
        <Card.Title>Members</Card.Title>
        <Card.Description>
          {linkedCount} of {members.length} members linked a Discord account.
          The bot mentions linked members who are in the server.
        </Card.Description>
      </Card.Header>
      <Card.Content className="space-y-3">
        {!linkingEnabled ? (
          <Alert>
            Turn on member linking in Discord Integration settings so members
            can link their accounts.
          </Alert>
        ) : null}

        {loading && !members.length ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            Failed to load the team’s Discord accounts. Please refresh.
          </Alert>
        ) : members.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            This team has no members yet.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="min-w-0 flex-1 truncate">
                  <MembersInline memberIds={[member.userId]} />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {member.link ? (
                    <span className="text-xs text-muted-foreground">
                      @{member.link.username}
                    </span>
                  ) : null}
                  <MemberLinkBadge member={member} />
                  {member.link ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUnlink(member)}
                      disabled={unlinking}
                    >
                      Unlink
                    </Button>
                  ) : linkingEnabled ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        remindMember({
                          variables: { teamId, userId: member.userId },
                        })
                      }
                      disabled={reminding}
                    >
                      Remind
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
