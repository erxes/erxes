/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react';
import { Collapsible } from 'erxes-ui/components/collapsible';
import { Button } from 'erxes-ui/components';
import { useState } from 'react';

const meta: Meta<typeof Collapsible> = {
  title: 'Components/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: ({ open }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Collapsible
        open={open || isOpen}
        onOpenChange={setIsOpen}
        className="w-[350px] space-y-2"
      >
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">
            @peduarte starred 3 repositories
          </h4>
          <Collapsible.Trigger asChild>
            <Button variant="ghost" size="sm">
              <Collapsible.TriggerIcon className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </Collapsible.Trigger>
        </div>
        <div className="rounded-md px-4 py-2 font-mono text-sm shadow-sm">
          @radix-ui/primitives
        </div>
        <Collapsible.Content className="space-y-2">
          <div className="rounded-md px-4 py-2 font-mono text-sm shadow-sm">
            @radix-ui/colors
          </div>
          <div className="rounded-md px-4 py-2 font-mono text-sm shadow-sm">
            @stitches/react
          </div>
        </Collapsible.Content>
      </Collapsible>
    );
  },
};

export const WithTriggerButton: Story = {
  render: () => (
    <div className="min-h-[500px]">
      <Collapsible className="w-[350px] space-y-2">
        <Collapsible.TriggerButton className="px-4">
          <div className="flex items-center gap-2">
            <Collapsible.TriggerIcon className="h-4 w-4" />
            <span>Click to expand</span>
          </div>
        </Collapsible.TriggerButton>
        <Collapsible.Content className="space-y-2 px-4 py-2">
          <div className="rounded-md px-4 py-3 font-mono text-sm">
            This content uses the TriggerButton component.
          </div>
        </Collapsible.Content>
      </Collapsible>
    </div>
  ),
};
