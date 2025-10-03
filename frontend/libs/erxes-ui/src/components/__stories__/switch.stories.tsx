import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from 'erxes-ui/components/switch';
import { Label } from 'erxes-ui/components/label';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'The controlled checked state of the switch',
    },
    disabled: {
      control: 'boolean',
      description:
        'When true, prevents the user from interacting with the switch',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: (args) => <Switch {...args} />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="checked" checked={true} />
        <Label htmlFor="checked">Checked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="unchecked" checked={false} />
        <Label htmlFor="unchecked">Unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled" disabled />
        <Label htmlFor="disabled">Disabled</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled-checked" disabled checked />
        <Label htmlFor="disabled-checked">Disabled (Checked)</Label>
      </div>
    </div>
  ),
};
