import { Checkbox, Table } from 'erxes-ui';
import { useUserInviteContext } from '../../hooks/useUserInviteContext';

export const InviteRowCheckbox = ({ userId }: { userId: string }) => {
  const { selectedUsers, setSelectedUsers } = useUserInviteContext();

  return (
    <Checkbox
      checked={selectedUsers?.includes(userId)}
      onCheckedChange={(checked) => {
        setSelectedUsers(
          checked
            ? [...selectedUsers, userId]
            : selectedUsers?.filter(
                (selectedId: string) => selectedId !== userId,
              ),
        );
      }}
    />
  );
};

export const InviteHeaderCheckbox = () => {
  const { selectedUsers, setSelectedUsers, fields } = useUserInviteContext();
  return (
    <Table.Head className="w-9">
      <div className="flex items-center justify-center">
        <Checkbox
          checked={selectedUsers?.length === fields?.length}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedUsers(fields?.map((user) => user.id));
            } else {
              setSelectedUsers([]);
            }
          }}
        />
      </div>
    </Table.Head>
  );
};
