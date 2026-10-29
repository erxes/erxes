import { IconLogout } from '@tabler/icons-react';
import { Command, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { useRevokeMemberSessions } from '@/settings/team-member/sessions/hooks/useMemberSessions';

export const MemberSignOutMenuItem = ({
  userId,
  onDone,
}: {
  userId: string;
  onDone: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { confirm } = useConfirm();
  const { revoke, loading } = useRevokeMemberSessions();

  return (
    <Can action="teamMembersResetPassword">
      <Command.Item
        value="sign-out-everywhere"
        disabled={loading}
        onSelect={() =>
          confirm({ message: t('confirm-sign-out-everywhere') }).then(() =>
            revoke(userId, undefined, onDone),
          )
        }
      >
        <IconLogout /> {t('sign-out-everywhere')}
      </Command.Item>
    </Can>
  );
};
