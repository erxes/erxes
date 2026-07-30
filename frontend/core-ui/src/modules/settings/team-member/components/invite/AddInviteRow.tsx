import { IconPlus } from '@tabler/icons-react';

import { useFormContext } from 'react-hook-form';

import { Button } from 'erxes-ui';
import { useUserInviteContext } from '../../hooks/useUserInviteContext';
import { IUserEntry, TUserForm } from '../../types';
import { useTranslation } from 'react-i18next';

export const AddInviteRowButton = ({
  append,
}: {
  append: (product: IUserEntry | IUserEntry[]) => void;
}) => {
  const { fields } = useUserInviteContext();
  const { control } = useFormContext<TUserForm>();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  const inviteUserDefaultValues = {
    email: '',
    password: '',
  };

  return (
    <>
      <Button
        variant="secondary"
        className="bg-border"
        onClick={() => append(inviteUserDefaultValues)}
      >
        <IconPlus />
        {t('add-invite', 'Add Invite')}
      </Button>
      <Button
        variant="secondary"
        className="bg-border"
        onClick={() =>
          append([
            inviteUserDefaultValues,
            inviteUserDefaultValues,
            inviteUserDefaultValues,
          ])
        }
      >
        <IconPlus />
        {t('add-multiple-invites', 'Add Multiple Invites')}
      </Button>
    </>
  );
};
