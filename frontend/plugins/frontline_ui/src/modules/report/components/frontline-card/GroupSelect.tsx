import { PopoverScoped, Combobox, Command } from 'erxes-ui';
import { useState } from 'react';

export const GroupSelect = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-2 shrink-0 flex-none">
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        Group By
      </span>
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.TriggerBase>
          <span className='text-xs'>Source Type</span>
        </Combobox.TriggerBase>
        <Combobox.Content>
          <Command>
            <Command.List>
              <Command.Item value="all">All</Command.Item>
              <Command.Item value="email">Email</Command.Item>
              <Command.Item value="phone">Phone</Command.Item>
              <Command.Item value="chat">Chat</Command.Item>
              <Command.Item value="social">Social</Command.Item>
              <Command.Item value="other">Other</Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </PopoverScoped>
    </div>
  );
};
