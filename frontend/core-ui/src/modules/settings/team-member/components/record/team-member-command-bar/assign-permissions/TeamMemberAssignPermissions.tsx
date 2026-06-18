import { useState } from 'react';
import { IconShieldCheck } from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  Collapsible,
  Label,
  Popover,
  RecordTable,
  Spinner,
  useToast,
} from 'erxes-ui';
import { Can } from 'ui-modules';
import {
  useGetPermissionDefaultGroups,
  useGetPermissionGroups,
} from '@/settings/permissions/hooks/useGetPermissionGroups';
import { useUsersUpdatePermissionGroups } from '@/settings/permissions/hooks/useUsersUpdatePermissionGroups';
import {
  IDefaultPermissionGroup,
  IGroupedByPlugin,
  IPermissionGroup,
} from '@/settings/permissions/types';

export const TeamMemberAssignPermissions = ({
  teamMemberIds,
}: {
  teamMemberIds: string[];
}) => {
  const [open, setOpen] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const { toast } = useToast();
  const { table } = RecordTable.useRecordTable();

  const { defaultGroups, loading: defaultLoading } =
    useGetPermissionDefaultGroups({ skip: !open });
  const { permissionGroups, loading: customLoading } = useGetPermissionGroups({
    skip: !open,
  });
  const { updatePermissionGroups, loading: updateLoading } =
    useUsersUpdatePermissionGroups();

  const toggle = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const handleApply = () => {
    if (!selectedGroupIds.length) return;

    updatePermissionGroups({
      variables: {
        userIds: teamMemberIds,
        groupIds: selectedGroupIds,
      },
      onCompleted: () => {
        toast({
          title: 'Permission groups assigned',
          description: `Updated ${teamMemberIds.length} team member(s)`,
          variant: 'success',
        });
        setSelectedGroupIds([]);
        setOpen(false);
        table.setRowSelection({});
      },
      onError: (error) => {
        toast({
          title: 'Error',
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
    <Can action="permissionsManage">
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button variant="secondary">
            <IconShieldCheck />
            Assign Permissions
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-96 p-0">
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <Spinner containerClassName="py-10" />
            ) : (
              <>
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
                    <Collapsible.Content className="pt-2 space-y-2">
                      {groups.map((group: IDefaultPermissionGroup) => (
                        <div
                          className="flex items-center gap-2 pl-2"
                          key={group.id}
                        >
                          <Checkbox
                            id={`assign-${group.id}`}
                            checked={selectedGroupIds.includes(group.id)}
                            disabled={updateLoading}
                            onCheckedChange={() => toggle(group.id)}
                          />
                          <Label
                            variant="peer"
                            htmlFor={`assign-${group.id}`}
                            className="flex-1"
                          >
                            {group.name}
                          </Label>
                        </div>
                      ))}
                    </Collapsible.Content>
                  </Collapsible>
                ))}

                {permissionGroups.length > 0 && (
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
                    <Collapsible.Content className="pt-2 space-y-2">
                      {permissionGroups.map((group: IPermissionGroup) => (
                        <div
                          className="flex items-center gap-2 pl-2"
                          key={group._id}
                        >
                          <Checkbox
                            id={`assign-${group._id}`}
                            checked={selectedGroupIds.includes(group._id)}
                            disabled={updateLoading}
                            onCheckedChange={() => toggle(group._id)}
                          />
                          <Label
                            variant="peer"
                            htmlFor={`assign-${group._id}`}
                            className="flex-1"
                          >
                            {group.name}
                          </Label>
                        </div>
                      ))}
                    </Collapsible.Content>
                  </Collapsible>
                )}
              </>
            )}
          </div>
          <div className="border-t p-3 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {selectedGroupIds.length} group(s) · {teamMemberIds.length}{' '}
              member(s)
            </span>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!selectedGroupIds.length || updateLoading}
            >
              {updateLoading ? <Spinner size="sm" /> : 'Apply'}
            </Button>
          </div>
        </Popover.Content>
      </Popover>
    </Can>
  );
};
