import type { Meta, StoryObj } from '@storybook/react';
import { Button, TextOverflowTooltip } from 'erxes-ui';
const meta: Meta<typeof TextOverflowTooltip> = {
  title: 'Components/TextOverflowTooltip',
  component: TextOverflowTooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    value: 'Hello world!',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'The text to be displayed in the tooltip.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextOverflowTooltip>;

export const Default: Story = {
  render: (args) => {
    return (
      <Button className="w-16">
        <TextOverflowTooltip {...args} />
      </Button>
    );
  },
};
