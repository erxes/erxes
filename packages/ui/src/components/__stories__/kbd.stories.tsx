import type { Meta, StoryObj } from '@storybook/react';
import { Kbd } from 'erxes-ui/components/kbd';
import { Button } from '../button';

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['background', 'foreground'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Default: Story = {
  render: (args) => {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Press <Kbd {...args}>Ctrl</Kbd> + <Kbd {...args}>Shift</Kbd> +{' '}
          <Kbd {...args}>P</Kbd> to open the command palette
        </div>
        <div className="text-sm text-muted-foreground">
          Press <Kbd {...args}>⌘</Kbd> + <Kbd {...args}>K</Kbd> to search
        </div>
      </div>
    );
  },
};

export const SingleKeys: Story = {
  render: () => {
    return (
      <div className="flex flex-wrap gap-4">
        <Kbd>A</Kbd>
        <Kbd>B</Kbd>
        <Kbd>C</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd>Enter</Kbd>
        <Kbd>Tab</Kbd>
        <Kbd>Del</Kbd>
        <Kbd>⌘</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌃</Kbd>
      </div>
    );
  },
};

export const KeyCombinations: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1">
          <Kbd>Alt</Kbd> + <Kbd>Tab</Kbd>
        </div>
        <div className="flex items-center gap-1">
          <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd>
        </div>
        <div className="flex items-center gap-1">
          <Kbd>⌘</Kbd> + <Kbd>⇧</Kbd> + <Kbd>4</Kbd>
        </div>
      </div>
    );
  },
};

export const WithButton: Story = {
  render: () => {
    return (
      <div className="flex items-center gap-2">
        <Button>
          Add <Kbd>C</Kbd>
        </Button>
        <Button variant="outline">
          Filter
          <Kbd variant="foreground">F</Kbd>
        </Button>
      </div>
    );
  },
};
