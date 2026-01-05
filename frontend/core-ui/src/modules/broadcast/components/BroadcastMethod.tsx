import { IconPlus } from '@tabler/icons-react';
import { Button, DropdownMenu, Label, useSetQueryStateByKey } from 'erxes-ui';

export const BroadcastMethod = ({ onSelect }: { onSelect: () => void }) => {
  const setQueryStateByKey = useSetQueryStateByKey();

  const handleSelect = (method: string) => {
    setQueryStateByKey('method', method);
    onSelect();
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>
          <IconPlus />
          New broadcast
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content side="bottom" align="end" className="w-72 min-w-0">
        <DropdownMenu.RadioGroup onValueChange={handleSelect}>
          <DropdownMenu.RadioItem value="email" className="cursor-pointer">
            <div className="flex flex-col gap-1 p-2">
              <Label variant="peer">Email</Label>
              <div className="text-xs text-accent-foreground">
                Master email marketing with fully customized templates
              </div>
            </div>
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem
            value="messenger"
            className="cursor-pointer"
            disabled
          >
            <div className="flex flex-col gap-1 p-2">
              <Label variant="peer">Messenger</Label>
              <div className="text-xs text-accent-foreground">
                Interact personally with direct in-app-messaging
              </div>
            </div>
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem
            value="notification"
            className="cursor-pointer"
            disabled
          >
            <div className="flex flex-col  gap-1 p-2">
              <Label variant="peer">Notification</Label>
              <div className="text-xs text-accent-foreground">
                Send automated notifications to your customers
              </div>
            </div>
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
