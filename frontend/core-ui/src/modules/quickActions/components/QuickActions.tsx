import * as React from 'react';

import {
  IconCalculator,
  IconCalendarWeek,
  IconCommand,
  IconCreditCard,
  IconMoodSmile,
  IconSearch,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';

import {
  Button,
  Command,
  Sidebar,
  useScopedHotkeys,
  Key,
  AppHotkeyScope,
} from 'erxes-ui';

export function QuickActions() {
  const [open, setOpen] = React.useState(false);

  useScopedHotkeys(
    `${Key.Meta}+k`,
    () => {
      setOpen(true);
    },
    AppHotkeyScope.CommandMenu,
  );

  return (
    <>
      <Sidebar.MenuButton onClick={() => setOpen(true)} asChild>
        <Button variant="secondary">
          <IconCommand />
        </Button>
      </Sidebar.MenuButton>
      <Sidebar.MenuButton onClick={() => setOpen(true)} asChild>
        <Button variant="secondary">
          <IconSearch />
        </Button>
      </Sidebar.MenuButton>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        dialogContentClassName="max-w-xl"
      >
        <Command.Input placeholder="Type a command or search..." />
        <Command.List className="styled-scroll">
          <Command.Empty>No results found.</Command.Empty>
          <Command.Group heading="Suggestions">
            <Command.Item>
              <IconCalendarWeek />
              <span>Calendar</span>
            </Command.Item>
            <Command.Item>
              <IconMoodSmile />
              <span>Search Emoji</span>
            </Command.Item>
            <Command.Item>
              <IconCalculator />
              <span>Calculator</span>
            </Command.Item>
          </Command.Group>
          <Command.Separator />
          <Command.Group heading="Settings">
            <Command.Item>
              <IconUser />
              <span>Profile</span>
              <Command.Shortcut>⌘P</Command.Shortcut>
            </Command.Item>
            <Command.Item>
              <IconCreditCard />
              <span>Billing</span>
              <Command.Shortcut>⌘B</Command.Shortcut>
            </Command.Item>
            <Command.Item>
              <IconSettings />
              <span>Settings</span>
              <Command.Shortcut>⌘S</Command.Shortcut>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
