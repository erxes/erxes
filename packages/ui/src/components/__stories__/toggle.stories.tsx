import type { Meta, StoryObj } from '@storybook/react';
import { IconBold } from '@tabler/icons-react';
import { Toggle } from 'erxes-ui';

const meta: Meta = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      options: ['xs', 'sm', 'default', 'lg'],
      description: 'Size of the toggle',
      defaultValue: 'default',
      control: 'select',
    },
    variant: {
      options: ['default', 'outline'],
      description: 'Variant of the toggle',
      defaultValue: 'default',
      control: 'select',
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: (args) => (
    <Toggle aria-label="Toggle italic" {...args}>
      <IconBold className="h-4 w-4" />
    </Toggle>
  ),
};
