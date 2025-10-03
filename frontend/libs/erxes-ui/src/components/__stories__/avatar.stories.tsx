import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from 'erxes-ui/components/avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl'],
      description: 'Size of the avatar',
      defaultValue: 'default',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <Avatar.Image src="https://github.com/shadcn.png" alt="User avatar" />
      <Avatar.Fallback>CN</Avatar.Fallback>
    </Avatar>
  ),
};
