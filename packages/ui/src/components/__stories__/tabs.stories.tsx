import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from 'erxes-ui/components/tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <Tabs.List className="grid w-full grid-cols-2">
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="password">Password</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account" className="p-4">
        <p>Account settings content goes here.</p>
      </Tabs.Content>
      <Tabs.Content value="password" className="p-4">
        <p>Password settings content goes here.</p>
      </Tabs.Content>
    </Tabs>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <Tabs.List className="w-fit">
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="password">Password</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account" className="p-4">
        <p>Account settings content goes here.</p>
      </Tabs.Content>
      <Tabs.Content value="password" className="p-4">
        <p>Password settings content goes here.</p>
      </Tabs.Content>
      <Tabs.Content value="settings" className="p-4">
        <p>Other settings content goes here.</p>
      </Tabs.Content>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <Tabs.List className="grid w-full grid-cols-3">
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="password">Password</Tabs.Trigger>
        <Tabs.Trigger value="settings" disabled>
          Settings
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account" className="p-4">
        <p>Account settings content goes here.</p>
      </Tabs.Content>
      <Tabs.Content value="password" className="p-4">
        <p>Password settings content goes here.</p>
      </Tabs.Content>
      <Tabs.Content value="settings" className="p-4">
        <p>Settings content goes here.</p>
      </Tabs.Content>
    </Tabs>
  ),
};
