import { useResendInvites } from '@/settings/team-member/hooks/useResendInvite';
import { EStatus, IUser } from '@/settings/team-member/types';
import { IconRefresh } from '@tabler/icons-react';
import { Command, RecordTable, Spinner, useToast } from 'erxes-ui';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const TeamMemberResendInvite = ({
  teamMembers,
  onCompleted,
}: {
  teamMembers: IUser[];
  onCompleted: () => void;
}) => {
  const { resendMany, loading } = useResendInvites();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  const pendingEmails = teamMembers
    .filter(({ status }) => status !== EStatus.Verified)
    .map(({ email }) => email);

  const handleResend = async () => {
    const { sent, failed, firstError } = await resendMany(pendingEmails);

    if (sent > 0) {
      toast({
        title: t('success'),
        variant: 'success',
        description: t('invitations-resent', { sentCount: sent }),
      });
      table.setRowSelection({});
      onCompleted();
    }

    if (failed > 0) {
      toast({
        title: t('error'),
        variant: 'destructive',
        description: `${t('failed-to-resend-invitations', {
          failedCount: failed,
        })}${firstError ? `: ${firstError}` : ''}`,
      });
    }
  };

  return (
    <Can action="teamMembersInvite">
      <Command.Item
        disabled={loading || pendingEmails.length === 0}
        onSelect={handleResend}
      >
        {loading ? <Spinner size="sm" /> : <IconRefresh />}
        {t('resend-invite')}
      </Command.Item>
    </Can>
  );
};
