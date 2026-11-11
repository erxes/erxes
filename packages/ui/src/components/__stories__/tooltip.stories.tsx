import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from 'erxes-ui/components/tooltip';
import { Button } from 'erxes-ui/components/button';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="outline">Hover me</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>This is a tooltip</p>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  ),
};

export const WithSideOffset: Story = {
  render: () => (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="outline">More space</Button>
        </Tooltip.Trigger>
        <Tooltip.Content sideOffset={16}>
          <p>This tooltip has more space</p>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  ),
};

export const WithCustomSide: Story = {
  render: () => (
    <div className="flex space-x-4">
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button variant="outline">Top</Button>
          </Tooltip.Trigger>
          <Tooltip.Content side="top">
            <p>Tooltip on top</p>
          </Tooltip.Content>
        </Tooltip>

        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button variant="outline">Right</Button>
          </Tooltip.Trigger>
          <Tooltip.Content side="right">
            <p>Tooltip on right</p>
          </Tooltip.Content>
        </Tooltip>

        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button variant="outline">Bottom</Button>
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">
            <p>Tooltip on bottom</p>
          </Tooltip.Content>
        </Tooltip>

        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button variant="outline">Left</Button>
          </Tooltip.Trigger>
          <Tooltip.Content side="left">
            <p>Tooltip on left</p>
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    </div>
  ),
};
