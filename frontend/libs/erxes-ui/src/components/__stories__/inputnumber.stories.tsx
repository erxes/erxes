import type { Meta, StoryObj } from '@storybook/react';
import { Input } from 'erxes-ui/components/input';

const meta: Meta<typeof Input.Number> = {
  title: 'Components/InputNumber',
  component: Input.Number,
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
    thousandsSeparator: {
      control: 'text',
      description: 'Thousands separator of the input element',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Input.Number>;

export const Default: Story = {
  args: {
    placeholder: 'Enter number...',
  },
};
