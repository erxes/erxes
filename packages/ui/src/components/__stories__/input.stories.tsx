import type { Meta, StoryObj } from '@storybook/react';
import { Input } from 'erxes-ui/components/input';
import { Label } from 'erxes-ui/components/label';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'When true, the input is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'search', 'tel', 'url', 'file'],
      description: 'Type of the input element',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
  render: (args) => <Input className="w-[300px]" {...args} />,
};

export const InputNumber: Story = {
  render: () => (
    <Input.Number
      id="number"
      placeholder="Number input"
      className="w-[300px]"
    />
  ),
};

export const InputTypes: Story = {
  render: () => (
    <div className="flex flex-col space-y-4 w-[300px]">
      <div className="space-y-1.5">
        <Label htmlFor="text">Text</Label>
        <Input id="text" placeholder="Text input" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Password input" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="disabled">Disabled</Label>
        <Input id="disabled" disabled placeholder="Disabled input" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="number">Number</Label>
        <Input.Number id="number" placeholder="Number input" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="file">File</Label>
        <Input type="file" className="w-[300px]" />
      </div>
    </div>
  ),
};
