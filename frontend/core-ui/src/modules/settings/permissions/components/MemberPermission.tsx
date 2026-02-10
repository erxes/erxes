import { IconEye } from '@tabler/icons-react';
import { Button, Checkbox, Collapsible, Label, Spinner, toast } from 'erxes-ui';
import {
  useGetPermissionDefaultGroups,
  useGetPermissionGroups,
} from '@/settings/permissions/hooks/useGetPermissionGroups';
import { useUserUpdatePermissionGroups } from '@/settings/permissions/hooks/useUserUpdatePermissionGroups';
import {
  IDefaultPermissionGroup,
  IGroupedByPlugin,
  IPermissionGroup,
} from '@/settings/permissions/types';
import { PermissionGroupDetails } from '@/settings/permissions/components/PermissionGroupDetails';

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
    const pluginPrefix = groupId.split(':')[0];
    let newPermissionGroupIds: string[];

    if (checked) {
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

  const groupedByPlugin: IGroupedByPlugin = {};
  for (const group of defaultGroups) {
    const plugin = group.plugin || 'other';
    if (!groupedByPlugin[plugin]) groupedByPlugin[plugin] = [];
    groupedByPlugin[plugin].push(group);
  }

  if (defaultLoading || customLoading) {
    return <Spinner containerClassName="py-20" />;
  }

  return (
    <div className="p-6 space-y-6">
      {Object.entries(groupedByPlugin).map(([plugin, groups]) => (
        <Collapsible key={plugin} className="group" defaultOpen>
          <Collapsible.Trigger asChild>
            <Button
              variant="secondary"
              className="w-full justify-start font-medium"
            >
              <Collapsible.TriggerIcon />
              <span className="capitalize">{plugin}</span>
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content className="pt-3 space-y-3">
            {groups.map((group: IDefaultPermissionGroup) => (
              <div className="flex items-center gap-2 flex-wrap" key={group.id}>
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
                <Label variant="peer" htmlFor={group.id} className="flex-1">
                  {group.name}
                </Label>
                <PermissionGroupDetails
                  group={group}
                  isDefault={true}
                  trigger={
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <IconEye size={16} />
                    </Button>
                  }
                />
              </div>
            ))}
          </Collapsible.Content>
        </Collapsible>
      ))}

      <Collapsible className="group" defaultOpen>
        <Collapsible.Trigger asChild>
          <Button
            variant="secondary"
            className="w-full justify-start font-medium"
          >
            <Collapsible.TriggerIcon />
            Custom Permission Groups
          </Button>
        </Collapsible.Trigger>
        <Collapsible.Content className="pt-3 space-y-3">
          {permissionGroups.map((group: IPermissionGroup) => (
            <div className="flex items-center gap-2 flex-wrap" key={group._id}>
              <Checkbox
                id={group._id}
                checked={permissionGroupIds.includes(group._id)}
                disabled={updateLoading}
                onCheckedChange={(checked) =>
                  handlePermissionGroupChange(group._id, checked as boolean)
                }
              />
              <Label variant="peer" htmlFor={group._id} className="flex-1">
                {group.name}
              </Label>
              <PermissionGroupDetails
                group={group}
                isDefault={false}
                trigger={
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <IconEye size={16} />
                  </Button>
                }
              />
            </div>
          ))}
        </Collapsible.Content>
      </Collapsible>
    </div>
  );
};
