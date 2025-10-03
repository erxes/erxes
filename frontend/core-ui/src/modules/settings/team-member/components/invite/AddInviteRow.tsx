import { IconPlus } from '@tabler/icons-react';

import { useFormContext } from 'react-hook-form';

import { Button } from 'erxes-ui';
import { useUserInviteContext } from '../../hooks/useUserInviteContext';
import { IUserEntry, TUserForm } from '../../types';

export const AddInviteRowButton = ({
  append,
}: {
  append: (product: IUserEntry | IUserEntry[]) => void;
}) => {
  const { fields } = useUserInviteContext();
  const { control } = useFormContext<TUserForm>();

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
        Add Invite
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
        Add Multiple Invites
      </Button>
    </>
  );
};
