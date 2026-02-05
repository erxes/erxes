import { IconDots, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  DropdownMenu,
  Spinner,
  Table,
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
import { PermissionGroupAdd } from './PermissionGroupAdd';

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
                  className="h-auto py-12 group-hover/table-row:bg-background"
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-full w-full justify-start hover:bg-transparent"
                          asChild
                        >
                          <div className="font-medium">{group.name}</div>
                        </Button>
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-full w-full justify-start hover:bg-transparent text-muted-foreground"
                          asChild
                        >
                          <div>{group.description}</div>
                        </Button>
                      </Table.Cell>
                      <Table.Cell className="w-8 p-0.5">
                        <DropdownMenu>
                          <DropdownMenu.Trigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-full w-full text-muted-foreground size-7"
                            >
                              <IconDots />
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content className="min-w-48">
                            <DropdownMenu.Item>
                              <IconEye size={16} />
                              View
                            </DropdownMenu.Item>
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

        {permissionGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No custom groups yet</p>
            <PermissionGroupAdd />
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Description</Table.Head>
                <Table.Head className="w-12"></Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {permissionGroups.map((group: IPermissionGroup) => (
                <Table.Row className="hover:bg-sidebar" key={group._id}>
                  <Table.Cell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-full w-full justify-start hover:bg-transparent"
                      asChild
                    >
                      <div className="font-medium">{group.name}</div>
                    </Button>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-full w-full justify-start hover:bg-transparent text-muted-foreground"
                      asChild
                    >
                      <div>{group.description}</div>
                    </Button>
                  </Table.Cell>
                  <Table.Cell className="w-8 p-0.5">
                    <CustomGroupDropdown group={group} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
};

const CustomGroupDropdown = ({ group }: { group: IPermissionGroup }) => {
  const { confirm } = useConfirm();
  // const { removeGroup, loading } = usePermissionGroupRemove();

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete "${group.name}"?`,
    }).then(() => {
      // removeGroup(group._id);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-full text-muted-foreground size-7"
        >
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="min-w-48">
        <DropdownMenu.Item>
          <IconEye size={16} />
          View
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <IconEdit size={16} />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item className="text-destructive" onClick={handleDelete}>
          <IconTrash size={16} />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
