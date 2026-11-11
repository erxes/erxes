import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../checkbox';
import { Label } from '../label';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'select',
      options: [true, false, 'indeterminate'],
      description: 'The controlled checked state of the checkbox',
    },
    disabled: {
      control: 'boolean',
      description:
        'When true, prevents the user from interacting with the checkbox',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: (args) => <Checkbox {...args} />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms" variant="peer">
        Accept terms and conditions
      </Label>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="checked" checked={true} />
        <Label htmlFor="checked" variant="peer">
          Checked
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="unchecked" checked={false} />
        <Label htmlFor="unchecked" variant="peer">
          Unchecked
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="indeterminate" checked="indeterminate" />
        <Label htmlFor="indeterminate" variant="peer">
          Indeterminate
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled" disabled />
        <Label htmlFor="disabled" variant="peer">
          Disabled
        </Label>
      </div>
    </div>
  ),
};
