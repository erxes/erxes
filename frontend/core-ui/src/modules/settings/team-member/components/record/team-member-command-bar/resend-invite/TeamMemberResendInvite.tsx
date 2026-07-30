import { useResendInvites } from '@/settings/team-member/hooks/useResendInvite';
import { EStatus, IUser } from '@/settings/team-member/types';
import { IconRefresh } from '@tabler/icons-react';
import { Button, RecordTable, Separator, Spinner, useToast } from 'erxes-ui';
import { Can } from 'ui-modules';

export const TeamMemberResendInvite = ({
  teamMembers,
}: {
  teamMembers: IUser[];
}) => {
  const { resendMany, loading } = useResendInvites();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();

  // Invitations can only be resent to members who have not confirmed theirs yet.
  const pendingEmails = teamMembers
    .filter(({ status }) => status !== EStatus.Verified)
    .map(({ email }) => email);

  const handleResend = async () => {
    const { sent, failed, firstError } = await resendMany(pendingEmails);

    if (sent > 0) {
      toast({
        title: 'Success',
        variant: 'success',
        description: `${sent} invitation(s) has been resent`,
      });
      table.setRowSelection({});
    }

    if (failed > 0) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: `Failed to resend ${failed} invitation(s)${
          firstError ? `: ${firstError}` : ''
        }`,
      });
    }
  };

  return (
    <Can action="teamMembersInvite">
      <Separator.Inline />
      <Button
        variant="secondary"
        disabled={loading || pendingEmails.length === 0}
        onClick={handleResend}
      >
        {loading ? <Spinner size="sm" /> : <IconRefresh />}
        Resend Invite
      </Button>
    </Can>
  );
};
