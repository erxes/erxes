import { useTranslation } from 'react-i18next';
import { IconEye } from '@tabler/icons-react';
import { Button, Checkbox, Collapsible, Label, Spinner, toast } from 'erxes-ui';
import { useGetPermissionGroups } from '@/settings/permissions/hooks/useGetPermissionGroups';
import { useUserUpdatePermissionGroups } from '@/settings/permissions/hooks/useUserUpdatePermissionGroups';
import { IPermissionGroup } from '@/settings/permissions/types';
import { groupPermissionGroupsByPlugin } from '@/settings/permissions/utils/groupPermissionGroups';
import { PermissionGroupDetails } from '@/settings/permissions/components/PermissionGroupDetails';
import { Can } from 'ui-modules';

export const MemberPermission = ({
  userId,
  permissionGroupIds = [],
}: {
  userId: string;
  permissionGroupIds?: string[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });
  const { permissionGroups, loading } = useGetPermissionGroups();
  const { updatePermissionGroups, loading: updateLoading } =
    useUserUpdatePermissionGroups();

  const handlePermissionGroupChange = (groupId: string, checked: boolean) => {
    const newPermissionGroupIds = checked
      ? [...permissionGroupIds, groupId]
      : permissionGroupIds.filter((id) => id !== groupId);

    updatePermissionGroups({
      variables: {
        userId,
        groupIds: newPermissionGroupIds,
      },
      onCompleted: () => {
        toast({
          title: t('permission-groups-updated'),
          description: t('permission-groups-updated-description'),
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: t('error'),
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

  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }

  const { pluginGroups, customGroups } =
    groupPermissionGroupsByPlugin(permissionGroups);

  const renderGroups = (groups: IPermissionGroup[]) =>
    groups.map((group) => (
      <div className="flex items-center gap-2 flex-wrap" key={group._id}>
        <Can action="permissionsManage">
          <Checkbox
            id={group._id}
            checked={permissionGroupIds.includes(group._id)}
            disabled={updateLoading}
            onCheckedChange={(checked) =>
              handlePermissionGroupChange(group._id, checked as boolean)
            }
          />
        </Can>
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
    ));

  return (
    <div className="p-6 space-y-6">
      {Object.entries(pluginGroups).map(([plugin, groups]) => (
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
            {renderGroups(groups)}
          </Collapsible.Content>
        </Collapsible>
      ))}

      {customGroups.length > 0 && (
        <Collapsible className="group" defaultOpen>
          <Collapsible.Trigger asChild>
            <Button
              variant="secondary"
              className="w-full justify-start font-medium"
            >
              <Collapsible.TriggerIcon />
              {t('custom-permission-groups')}
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content className="pt-3 space-y-3">
            {renderGroups(customGroups)}
          </Collapsible.Content>
        </Collapsible>
      )}
    </div>
  );
};
