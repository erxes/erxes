import type { Meta, StoryObj } from '@storybook/react';
import { Label } from 'erxes-ui/components/label';
import { Checkbox } from 'erxes-ui/components/checkbox';
import { RadioGroup } from 'erxes-ui/components/radio-group';
import { Switch } from 'erxes-ui/components/switch';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'peer'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: (args) => {
    return (
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="email" {...args}>
          Email
        </Label>
      </div>
    );
  },
};

export const WithCheckbox: Story = {
  render: () => {
    return (
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms" variant="peer">
          Accept terms and conditions
        </Label>
      </div>
    );
  },
};

export const WithRadioGroup: Story = {
  render: () => {
    return (
      <RadioGroup defaultValue="option-one">
        <div className="flex items-center space-x-2">
          <RadioGroup.Item value="option-one" id="option-one" />
          <Label htmlFor="option-one" variant="peer">
            Option One
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroup.Item value="option-two" id="option-two" />
          <Label htmlFor="option-two" variant="peer">
            Option Two
          </Label>
        </div>
      </RadioGroup>
    );
  },
};

export const WithSwitch: Story = {
  render: () => {
    return (
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode" variant="peer">
          Airplane Mode
        </Label>
      </div>
    );
  },
};
