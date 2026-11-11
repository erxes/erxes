import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup } from 'erxes-ui/components/radio-group';
import { Label } from 'erxes-ui/components/label';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: 'text',
      description:
        'The value of the radio item that should be checked by default',
    },
    disabled: {
      control: 'boolean',
      description:
        'When true, prevents the user from interacting with the radio items',
    },
  },
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center space-x-2">
        <RadioGroup.Item value="option-1" id="option-1" />
        <Label variant="peer" htmlFor="option-1">
          Option 1
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroup.Item value="option-2" id="option-2" />
        <Label variant="peer" htmlFor="option-2">
          Option 2
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroup.Item value="option-3" id="option-3" />
        <Label variant="peer" htmlFor="option-3">
          Option 3
        </Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1" disabled>
      <div className="flex items-center space-x-2">
        <RadioGroup.Item value="option-1" id="disabled-1" />
        <Label variant="peer" htmlFor="disabled-1">
          Disabled Option 1
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroup.Item value="option-2" id="disabled-2" />
        <Label variant="peer" htmlFor="disabled-2">
          Disabled Option 2
        </Label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1" className="flex flex-row space-x-4">
      <div className="flex items-center space-x-2">
        <RadioGroup.Item value="option-1" id="horizontal-1" />
        <Label variant="peer" htmlFor="horizontal-1">
          Option 1
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroup.Item value="option-2" id="horizontal-2" />
        <Label variant="peer" htmlFor="horizontal-2">
          Option 2
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroup.Item value="option-3" id="horizontal-3" />
        <Label variant="peer" htmlFor="horizontal-3">
          Option 3
        </Label>
      </div>
    </RadioGroup>
  ),
};
