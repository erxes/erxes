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
import { useGetPermissionGroups } from '@/settings/permissions/hooks/useGetPermissionGroups';
import { useUsersUpdatePermissionGroups } from '@/settings/permissions/hooks/useUsersUpdatePermissionGroups';
import { IPermissionGroup } from '@/settings/permissions/types';
import { groupPermissionGroupsByPlugin } from '@/settings/permissions/utils/groupPermissionGroups';

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

  const { permissionGroups, loading } = useGetPermissionGroups();
  const { updatePermissionGroups, loading: updateLoading } =
    useUsersUpdatePermissionGroups();

  const toggle = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id)
        ? prev.filter((groupId) => groupId !== id)
        : [...prev, id],
    );
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
            count: teamMemberIds.length,
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

  const { pluginGroups, customGroups } =
    groupPermissionGroupsByPlugin(permissionGroups);

  const renderGroups = (groups: IPermissionGroup[], prefix: string) =>
    groups.map((group) => (
      <Command.Item
        key={group._id}
        value={`${prefix} ${group.name}`}
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
    ));

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
            {Object.entries(pluginGroups).map(([plugin, groups]) => (
              <Command.Group
                key={plugin}
                heading={<span className="capitalize">{plugin}</span>}
              >
                {renderGroups(groups, plugin)}
              </Command.Group>
            ))}

            {customGroups.length > 0 && (
              <Command.Group heading={t('custom-permission-groups')}>
                {renderGroups(customGroups, 'custom')}
              </Command.Group>
            )}
          </>
        )}
      </Command.List>
      <div className="flex items-center justify-between gap-2 border-t p-3">
        <span className="text-xs text-muted-foreground">
          {t('groups-count', { count: selectedGroupIds.length })} ·{' '}
          {t('members-count', { count: teamMemberIds.length })}
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
