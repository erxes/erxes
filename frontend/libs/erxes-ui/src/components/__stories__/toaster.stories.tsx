import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from 'erxes-ui/components/toasts';
import { Button, Toaster, useToast } from 'erxes-ui';
const meta: Meta = {
  title: 'Components/Toast',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { variant: 'default', title: 'Title', description: 'Description' },
  argTypes: {
    variant: {
      options: ['default', 'destructive'],
      description: 'Variant of the toast',
      defaultValue: 'default',
      control: 'select',
    },
    title: {
      description: 'Title of the toast',
      control: 'text',
    },
    description: {
      description: 'Description of the toast',
      control: 'text',
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  decorators: [
    (Story, context) => {
      const { toast } = useToast();
      return (
        <div className="flex items-center justify-center w-screen max-w-4xl h-screen ">
          <Button
            onClick={() => {
              toast({ ...context.args });
            }}
          >
            Click!
          </Button>
          <Story />
          <Toaster />
        </div>
      );
    },
  ],
};
