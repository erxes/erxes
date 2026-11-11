/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react';
import { DropdownMenu } from 'erxes-ui/components/dropdown-menu';
import { Button } from 'erxes-ui/components/button';
import { useState } from 'react';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-56">
        <DropdownMenu.Label>My Account</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item>
            Profile
            <DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            Billing
            <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            Settings
            <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            Keyboard shortcuts
            <DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item>Team</DropdownMenu.Item>
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
          <DropdownMenu.Item>
            New Team
            <DropdownMenu.Shortcut>⌘+T</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>GitHub</DropdownMenu.Item>
        <DropdownMenu.Item>Support</DropdownMenu.Item>
        <DropdownMenu.Item disabled>API</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          Log out
          <DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
};

export const WithCheckboxItems: Story = {
  render: () => {
    const [showStatusBar, setShowStatusBar] = useState<boolean>(true);
    const [showActivityBar, setShowActivityBar] = useState<boolean>(false);
    const [showPanel, setShowPanel] = useState<boolean>(false);
    return (
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="outline">Open</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="w-56">
          <DropdownMenu.Label>Appearance</DropdownMenu.Label>
          <DropdownMenu.Separator />
          <DropdownMenu.CheckboxItem
            checked={showStatusBar}
            onCheckedChange={setShowStatusBar}
          >
            Status Bar
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={showActivityBar}
            onCheckedChange={setShowActivityBar}
            disabled
          >
            Activity Bar
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={showPanel}
            onCheckedChange={setShowPanel}
          >
            Panel
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>
    );
  },
};

export const WithRadioItems: Story = {
  render: () => {
    const [position, setPosition] = useState('bottom');
    return (
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="outline">Open</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="w-56">
          <DropdownMenu.Label>Panel Position</DropdownMenu.Label>
          <DropdownMenu.Separator />
          <DropdownMenu.RadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenu.RadioItem value="top">Top</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="bottom">
              Bottom
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="right">Right</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
    );
  },
};
