import { useMutation } from '@apollo/client';
import { IconShieldOff } from '@tabler/icons-react';
import { Command, toast, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { AUTH_TWO_FACTOR_RESET } from '@/settings/two-factor/graphql';

/** For a lost phone: clears the member's 2FA and signs them out everywhere. */
export const MemberResetTwoFactorMenuItem = ({
  userId,
  onDone,
}: {
  userId: string;
  onDone: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'two-factor' });
  const { confirm } = useConfirm();
  const [reset, { loading }] = useMutation(AUTH_TWO_FACTOR_RESET, {
    refetchQueries: ['userSessions'],
  });

  return (
    <Can action="teamMembersResetPassword">
      <Command.Item
        value="reset-two-factor"
        disabled={loading}
        onSelect={() =>
          confirm({ message: t('confirm-reset') }).then(() =>
            reset({
              variables: { userId },
              onCompleted: () => {
                toast({ title: t('reset-done'), variant: 'success' });
                onDone();
              },
              onError: (e) =>
                toast({ title: e.message, variant: 'destructive' }),
            }),
          )
        }
      >
        <IconShieldOff /> {t('reset')}
      </Command.Item>
    </Can>
  );
};
