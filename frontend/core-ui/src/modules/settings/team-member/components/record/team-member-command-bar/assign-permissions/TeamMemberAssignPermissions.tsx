import { useState } from 'react';
import {
  IconArrowLeft,
  IconChevronRight,
  IconShieldCheck,
} from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  Command,
  RecordTable,
  Spinner,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import {
  useGetPermissionDefaultGroups,
  useGetPermissionGroups,
} from '@/settings/permissions/hooks/useGetPermissionGroups';
import { useUsersUpdatePermissionGroups } from '@/settings/permissions/hooks/useUsersUpdatePermissionGroups';
import { IGroupedByPlugin } from '@/settings/permissions/types';

export const TeamMemberAssignPermissionsTrigger = ({
  onSelect,
}: {
  onSelect: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  return (
    <Can action="permissionsManage">
      <Command.Item className="w-full justify-between" onSelect={onSelect}>
        <span className="flex items-center gap-2">
          <IconShieldCheck />
          {t('assign-permissions')}
        </span>
        <IconChevronRight />
      </Command.Item>
    </Can>
  );
};

export const TeamMemberAssignPermissionsContent = ({
  teamMemberIds,
  initialGroupIds,
  onBack,
  onClose,
}: {
  teamMemberIds: string[];
  initialGroupIds: string[];
  onBack: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [selectedGroupIds, setSelectedGroupIds] =
    useState<string[]>(initialGroupIds);
  const { toast } = useToast();
  const { table } = RecordTable.useRecordTable();

  const { defaultGroups, loading: defaultLoading } =
    useGetPermissionDefaultGroups();
  const { permissionGroups, loading: customLoading } = useGetPermissionGroups();
  const { updatePermissionGroups, loading: updateLoading } =
    useUsersUpdatePermissionGroups();

  const toggle = (id: string) => {
    setSelectedGroupIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((groupId) => groupId !== id);
      }

      if (id.includes(':')) {
        const pluginPrefix = id.split(':')[0];
        return [
          ...prev.filter((groupId) => groupId.split(':')[0] !== pluginPrefix),
          id,
        ];
      }

      return [...prev, id];
    });
  };

  const handleApply = () => {
    if (!selectedGroupIds.length) return;

    updatePermissionGroups({
      variables: {
        userIds: teamMemberIds,
        groupIds: selectedGroupIds,
      },
      refetchQueries: ['Users'],
      awaitRefetchQueries: true,
      onCompleted: () => {
        toast({
          title: t('permission-groups-assigned'),
          description: t('updated-team-members', {
            memberCount: teamMemberIds.length,
          }),
          variant: 'success',
        });
        setSelectedGroupIds([]);
        onClose();
        table.setRowSelection({});
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
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

  const loading = defaultLoading || customLoading;

  return (
    <Command className="w-96">
      <Command.Input />
      <Command.List className="max-h-96">
        <Command.Group className="p-1">
          <Command.Item onSelect={onBack}>
            <IconArrowLeft />
            {t('back')}
          </Command.Item>
        </Command.Group>
        <Command.Separator />
        {loading ? (
          <Command.Item disabled>
            <Spinner size="sm" />
          </Command.Item>
        ) : (
          <>
            {Object.entries(groupedByPlugin).map(([plugin, groups]) => (
              <Command.Group
                key={plugin}
                heading={<span className="capitalize">{plugin}</span>}
              >
                {groups.map((group) => (
                  <Command.Item
                    key={group.id}
                    value={`${plugin} ${group.name}`}
                    disabled={updateLoading}
                    onSelect={() => toggle(group.id)}
                  >
                    <Checkbox
                      checked={selectedGroupIds.includes(group.id)}
                      className="pointer-events-none"
                      aria-label={group.name}
                    />
                    {group.name}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}

            {permissionGroups.length > 0 && (
              <Command.Group heading={t('custom-permission-groups')}>
                {permissionGroups.map((group) => (
                  <Command.Item
                    key={group._id}
                    value={`custom ${group.name}`}
                    disabled={updateLoading}
                    onSelect={() => toggle(group._id)}
                  >
                    <Checkbox
                      checked={selectedGroupIds.includes(group._id)}
                      className="pointer-events-none"
                      aria-label={group.name}
                    />
                    {group.name}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </>
        )}
      </Command.List>
      <div className="flex items-center justify-between gap-2 border-t p-3">
        <span className="text-xs text-muted-foreground">
          {t('groups-members-count', {
            groupCount: selectedGroupIds.length,
            memberCount: teamMemberIds.length,
          })}
        </span>
        <Button
          size="sm"
          onClick={handleApply}
          disabled={!selectedGroupIds.length || updateLoading}
        >
          {updateLoading ? <Spinner size="sm" /> : t('apply')}
        </Button>
      </div>
    </Command>
  );
};
