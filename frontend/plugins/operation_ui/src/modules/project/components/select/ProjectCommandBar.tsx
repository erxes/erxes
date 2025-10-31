import { IconRepeat, IconSquare, IconTrash } from '@tabler/icons-react';

import {
  Button,
  CommandBar,
  Separator,
  useConfirm,
  RecordTable,
  DropdownMenu,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { projectsCommandBarOpen } from '@/project/states/projectsCommandBar';

export const ProjectsCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const projectsRemove = (ids: any) => {
    return;
  };
  const { confirm } = useConfirm();

  const confirmOptions = { confirmationValue: 'delete' };

  const onRemove = () => {
    const ids: string[] =
      table.getSelectedRowModel().rows?.map((row) => row.original._id) || [];
    confirm({
      message: `Are you sure you want to remove the selected(${ids?.length})?`,
      options: confirmOptions,
    }).then(async () => {
      try {
        projectsRemove({
          variables: {
            ids,
          },
        });
      } catch (e) {
        console.error(e);
      }
    });
  };

  const getSelectedIds = () =>
    table.getSelectedRowModel().rows?.map((row) => row.original._id) || [];

  const handleActionEdit = () => {
    const ids = getSelectedIds();
    console.log('edits action for ids', ids);
  };
  const handleActionDuplicate = () => {
    const ids = getSelectedIds();
    console.log('duplicate action for ids', ids);
  };
  const handleActionExport = () => {
    const ids = getSelectedIds();
    console.log('exports action for ids', ids);
  };

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <ActionsCommandBar />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const ActionsCommandBar = () => {
  const [open, setOpen] = useAtom(projectsCommandBarOpen);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary">
          <IconRepeat />
          Actions
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content side="top" sideOffset={24}>
        <DropdownMenu.Group>
          <DropdownMenu.Item asChild>
            <Button variant="ghost">
              <IconSquare />
              Assign to
            </Button>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Button variant="ghost">
              <IconSquare />
              Assign to me
            </Button>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Button variant="ghost">
              <IconSquare />
              Change Status
            </Button>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Button variant="ghost">
              <IconTrash />
              Delete
            </Button>
          </DropdownMenu.Item>

          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Invite users</DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Email</DropdownMenu.Item>
                <DropdownMenu.Item>Message</DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item>More...</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
