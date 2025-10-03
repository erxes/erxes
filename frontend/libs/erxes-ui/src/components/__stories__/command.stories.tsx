/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react';
import { Command } from 'erxes-ui/components/command';
import { IconSearch } from '@tabler/icons-react';
import { Button } from '../button';
import { useState } from 'react';

const meta: Meta<typeof Command> = {
  title: 'Components/Command',
  component: Command,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Command>;

export const Default: Story = {
  render: () => {
    return (
      <div className="w-96">
        <Command>
          <Command.Input
            placeholder="Type a command or search..."
            variant="secondary"
          />
          <Command.List className="p-0">
            <Command.Empty>No results found.</Command.Empty>
            <Command.Group heading="Suggestions">
              <Command.Item>Calendar</Command.Item>
              <Command.Item>Search</Command.Item>
              <Command.Item>Settings</Command.Item>
            </Command.Group>
            <Command.Separator />
            <Command.Group heading="Recent">
              <Command.Item>Dashboard</Command.Item>
              <Command.Item>Projects</Command.Item>
              <Command.Item>Team</Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    );
  },
};

export const WithDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="w-96">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open Command
        </Button>
        <Command.Dialog open={open} onOpenChange={setOpen}>
          <Command.Input placeholder="Type a command or search..." />
          <Command.List className="p-0">
            <Command.Empty>No results found.</Command.Empty>
            <Command.Group heading="Actions">
              <Command.Item>New File</Command.Item>
              <Command.Item>New Folder</Command.Item>
              <Command.Item>New Project</Command.Item>
            </Command.Group>
            <Command.Separator />
            <Command.Group heading="Navigation">
              <Command.Item>Go to Dashboard</Command.Item>
              <Command.Item>Go to Settings</Command.Item>
              <Command.Item>Go to Profile</Command.Item>
            </Command.Group>
          </Command.List>
        </Command.Dialog>
      </div>
    );
  },
};
