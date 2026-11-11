import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from 'erxes-ui/components';

const meta: Meta<typeof Separator> = {
  title: 'Components/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the separator',
    },
    decorative: {
      control: 'boolean',
      description: 'The decorative property of the separator',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Separator>;
export const Default: Story = {
  render: () => (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none mb-2">
          Radix Primitives
        </h4>
        <Separator />
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
    </div>
  ),
};

export const vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>Blog</div>
      <Separator orientation="vertical" />
      <div>Docs</div>
      <Separator orientation="vertical" />
      <div>Source</div>
    </div>
  ),
};
