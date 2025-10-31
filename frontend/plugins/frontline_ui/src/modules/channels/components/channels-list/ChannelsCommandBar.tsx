import { IconRepeat, IconSquare, IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, DropdownMenu, Separator } from 'erxes-ui';
import { channelCommandBarOpen } from '../states/channelCommandBar';
import { useAtom } from 'jotai';

type Props = {
  selected?: string[] | undefined;
};

export const ChannelsCommandBar = ({ selected }: Props) => {
  return (
    <CommandBar open={selected?.length ? true : false}>
      <CommandBar.Bar>
        <CommandBar.Value>{selected?.length} selected</CommandBar.Value>
        <Separator.Inline />
        <ActionsCommandBar />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const ActionsCommandBar = () => {
  const [open, setOpen] = useAtom(channelCommandBarOpen);
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
