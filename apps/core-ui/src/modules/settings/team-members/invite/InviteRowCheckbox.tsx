import { Checkbox, Table } from 'erxes-ui';
import { useUserInviteContext } from './InviteMemberContext';

export const InviteRowCheckbox = ({ userId }: { userId: string }) => {
  const { selectedUsers, setSelectedUsers } = useUserInviteContext();

  return (
    <Checkbox
      checked={selectedUsers.includes(userId)}
      onCheckedChange={(checked) =>
        setSelectedUsers(checked ? [...selectedUsers, userId] : selectedUsers.filter((id) => id !== userId))
      }
    />
  );
};

export const InviteHeaderCheckbox = () => {
  const { selectedUsers, setSelectedUsers, fields } = useUserInviteContext();

  return (
    <Table.Head className="w-9">
      <div className="flex items-center justify-center">
        <Checkbox
          checked={fields.length > 0 && selectedUsers.length === fields.length}
          onCheckedChange={(checked) => setSelectedUsers(checked ? fields.map((user) => user.id) : [])}
        />
      </div>
    </Table.Head>
  );
};
