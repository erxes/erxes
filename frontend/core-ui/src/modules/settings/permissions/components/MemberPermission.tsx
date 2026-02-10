import { Checkbox, InfoCard, Label, Spinner, toast } from 'erxes-ui';
import {
  useGetPermissionDefaultGroups,
  useGetPermissionGroups,
} from '../hooks/useGetPermissionGroups';
import { useUserUpdatePermissionGroups } from '../hooks/useUserUpdatePermissionGroups';

export const MemberPermission = ({
  userId,
  permissionGroupIds = [],
}: {
  userId: string;
  permissionGroupIds?: string[];
}) => {
  const { defaultGroups, loading: defaultLoading } =
    useGetPermissionDefaultGroups();
  const { permissionGroups, loading: customLoading } = useGetPermissionGroups();
  const { updatePermissionGroups, loading: updateLoading } =
    useUserUpdatePermissionGroups();

  const handlePermissionGroupChange = (
    groupId: string,
    checked: boolean,
    isDefaultGroup = false,
  ) => {
    // Compute the new permission group IDs
    const pluginPrefix = groupId.split(':')[0];
    let newPermissionGroupIds: string[];

    if (checked) {
      // If adding a default group, ensure only one default group per plugin
      if (isDefaultGroup) {
        newPermissionGroupIds = [
          ...permissionGroupIds.filter((id) => !id.startsWith(pluginPrefix)),
          groupId,
        ];
      } else {
        newPermissionGroupIds = [...permissionGroupIds, groupId];
      }
    } else {
      newPermissionGroupIds = permissionGroupIds.filter((id) => id !== groupId);
    }

    updatePermissionGroups({
      variables: {
        userId,
        groupIds: newPermissionGroupIds,
      },
      onCompleted: () => {
        toast({
          title: 'Permission groups updated',
          description: 'Permission groups updated successfully',
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      update: (cache, { data }) => {
        if (!data?.userUpdatePermissionGroups) return;
        cache.modify({
          id: cache.identify(data.userUpdatePermissionGroups),
          fields: {
            permissionGroupIds: () => newPermissionGroupIds,
          },
          optimistic: true,
        });
      },
    });
  };

  if (defaultLoading || customLoading) {
    return <Spinner containerClassName="py-20" />;
  }

  return (
    <div className="p-6 space-y-6">
      <InfoCard title="Default Permission Groups">
        <InfoCard.Content>
          {defaultGroups.map((group) => (
            <div className="flex items-center gap-2" key={group.id}>
              <Checkbox
                id={group.id}
                checked={permissionGroupIds.includes(group.id)}
                disabled={updateLoading}
                onCheckedChange={(checked) =>
                  handlePermissionGroupChange(
                    group.id,
                    checked as boolean,
                    true,
                  )
                }
              />
              <Label variant="peer" htmlFor={group.id}>
                {group.name}
              </Label>
            </div>
          ))}
        </InfoCard.Content>
      </InfoCard>
      <InfoCard title="Custom Permission Groups">
        <InfoCard.Content>
          {permissionGroups.map((group) => (
            <div className="flex items-center gap-2" key={group._id}>
              <Checkbox
                id={group._id}
                checked={permissionGroupIds.includes(group._id)}
                disabled={updateLoading}
                onCheckedChange={(checked) =>
                  handlePermissionGroupChange(group._id, checked as boolean)
                }
              />
              <Label variant="peer" htmlFor={group._id}>
                {group.name}
              </Label>
            </div>
          ))}
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
