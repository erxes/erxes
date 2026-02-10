import {
  IconDots,
  IconEdit,
  IconEye,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  DropdownMenu,
  Spinner,
  Table,
  toast,
  useConfirm,
} from 'erxes-ui';
import {
  useGetPermissionDefaultGroups,
  useGetPermissionGroups,
} from '@/settings/permissions/hooks/useGetPermissionGroups';
import {
  IDefaultPermissionGroup,
  IGroupedByPlugin,
  IPermissionGroup,
} from '@/settings/permissions/types';
import { PermissionGroupAdd } from '@/settings/permissions/components/form/PermissionGroupAdd';
import { useRemovePermissionGroup } from '@/settings/permissions/hooks/useRemovePermissionGroup';
import { PermissionGroupEdit } from './form/PermissionGroupEdit';
import { PermissionGroupDetails } from './PermissionGroupDetails';

export const PermissionGroups = () => {
  const { defaultGroups, loading: defaultLoading } =
    useGetPermissionDefaultGroups();
  const { permissionGroups, loading: customLoading } = useGetPermissionGroups();

  if (defaultLoading || customLoading) {
    return (
      <div className="m-3">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Description</Table.Head>
                <Table.Head className="w-12"></Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row className="hover:bg-background">
                <Table.Cell
                  colSpan={3}
                  className="h-auto py-12 group-hover/table-row:bg-background border-none"
                >
                  <Spinner />
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      </div>
    );
  }

  const groupedByPlugin: IGroupedByPlugin = {};
  for (const group of defaultGroups) {
    const plugin = group.plugin || 'other';
    if (!groupedByPlugin[plugin]) groupedByPlugin[plugin] = [];
    groupedByPlugin[plugin].push(group);
  }

  return (
    <div className="m-3">
      <div className="max-w-lg mx-auto flex flex-col gap-2">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Description</Table.Head>
              <Table.Head className="w-12"></Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>

        {/* Default Groups */}
        {Object.entries(groupedByPlugin).map(([plugin, groups]) => (
          <Collapsible className="group" defaultOpen key={plugin}>
            <div className="relative">
              <Collapsible.Trigger asChild>
                <Button variant="secondary" className="w-full justify-start">
                  <Collapsible.TriggerIcon />
                  <span className="flex items-center gap-2">
                    Plugin {plugin}
                  </span>
                </Button>
              </Collapsible.Trigger>
            </div>
            <Collapsible.Content className="pt-2">
              <Table className="[&_tr_td]:border-b-0 [&_tr_td:first-child]:border-l-0 [&_tr_td]:border-r-0">
                <Table.Body>
                  {groups.map((group: IDefaultPermissionGroup) => (
                    <Table.Row className="hover:bg-sidebar" key={group.id}>
                      <Table.Cell>
                        <div className="font-medium">{group.name}</div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-muted-foreground">
                          {group.description}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="w-8 p-0.5">
                        <DropdownMenu>
                          <DropdownMenu.Trigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground size-7"
                            >
                              <IconDots />
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content className="min-w-48">
                            <PermissionGroupDetails
                              group={group}
                              isDefault={true}
                              trigger={
                                <DropdownMenu.Item
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <IconEye size={16} />
                                  View
                                </DropdownMenu.Item>
                              }
                            />
                          </DropdownMenu.Content>
                        </DropdownMenu>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Collapsible.Content>
          </Collapsible>
        ))}

        {/* Custom Groups */}
        <Collapsible className="group" defaultOpen>
          <div className="relative">
            <Collapsible.Trigger asChild>
              <Button variant="secondary" className="w-full justify-start">
                <Collapsible.TriggerIcon />
                <span className="flex items-center gap-2">Custom Groups</span>
              </Button>
            </Collapsible.Trigger>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <PermissionGroupAdd
                text=""
                trigger={
                  <Button variant="ghost" size="icon" className="size-7">
                    <IconPlus size={16} />
                  </Button>
                }
              />
            </div>
          </div>
          <Collapsible.Content className="pt-2">
            {permissionGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">
                  No custom groups yet
                </p>
                <PermissionGroupAdd />
              </div>
            ) : (
              <Table className="[&_tr_td]:border-b-0 [&_tr_td:first-child]:border-l-0 [&_tr_td]:border-r-0">
                <Table.Body>
                  {permissionGroups.map((group: IPermissionGroup) => (
                    <Table.Row className="hover:bg-sidebar" key={group._id}>
                      <Table.Cell>
                        <div className="font-medium">{group.name}</div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-muted-foreground">
                          {group.description || 'No description'}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="w-8 p-0.5">
                        <CustomGroupDropdown group={group} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Collapsible.Content>
        </Collapsible>
      </div>
    </div>
  );
};

const CustomGroupDropdown = ({ group }: { group: IPermissionGroup }) => {
  const { confirm } = useConfirm();
  const { removePermissionGroup } = useRemovePermissionGroup();

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete "${group.name}"?`,
    }).then(() => {
      removePermissionGroup({
        variables: { _id: group._id },
        onCompleted: () => {
          toast({ title: 'Permission group deleted', variant: 'success' });
        },
        onError: (error) => {
          toast({
            title: 'Error deleting permission group',
            variant: 'destructive',
            description: error.message,
          });
        },
      });
    });
  };
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground size-7"
        >
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="min-w-48">
        <PermissionGroupDetails
          group={group}
          isDefault={false}
          trigger={
            <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
              <IconEye size={16} />
              View
            </DropdownMenu.Item>
          }
        />
        <PermissionGroupEdit
          group={group}
          trigger={
            <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
              <IconEdit size={16} />
              Edit
            </DropdownMenu.Item>
          }
        />
        <DropdownMenu.Separator />
        <DropdownMenu.Item className="text-destructive" onClick={handleDelete}>
          <IconTrash size={16} />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
