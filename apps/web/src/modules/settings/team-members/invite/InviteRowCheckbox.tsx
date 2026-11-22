import { Checkbox, Table } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useUserInviteContext } from './InviteMemberContext';

export const InviteRowCheckbox = ({ userId }: { userId: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { selectedUsers, setSelectedUsers } = useUserInviteContext();

  return (
    <Checkbox
      aria-label={t('select-invite')}
      checked={selectedUsers.includes(userId)}
      onCheckedChange={(checked) =>
        setSelectedUsers(
          checked ? [...selectedUsers, userId] : selectedUsers.filter((id) => id !== userId),
        )
      }
    />
  );
};

export const InviteHeaderCheckbox = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { selectedUsers, setSelectedUsers, fields } = useUserInviteContext();

  return (
    <Table.Head className="w-9">
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label={t('select-all-invites')}
          checked={fields.length > 0 && selectedUsers.length === fields.length}
          onCheckedChange={(checked) =>
            setSelectedUsers(checked ? fields.map((user) => user.id) : [])
          }
        />
      </div>
    </Table.Head>
  );
};
