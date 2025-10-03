import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from 'erxes-ui';

const meta: Meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      options: ['small', 'medium', 'large'],
      description: 'Size of the spinner',
      defaultValue: 'medium',
      control: 'select',
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center h-40">
      <Spinner {...args} />
    </div>
  ),
};
