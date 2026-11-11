import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from 'erxes-ui/components/popover';
import { Button } from 'erxes-ui/components/button';
import { Input } from 'erxes-ui/components/input';
import { Label } from 'erxes-ui/components/label';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline">Open popover</Button>
      </Popover.Trigger>
      <Popover.Content className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </Popover.Content>
    </Popover>
  ),
};

export const Placement: Story = {
  render: () => (
    <div className="flex items-center justify-center space-x-4">
      <Popover>
        <Popover.Trigger asChild>
          <Button variant="outline">Top</Button>
        </Popover.Trigger>
        <Popover.Content side="top" className="w-40">
          <div className="text-center">
            <p>This popover appears on top</p>
          </div>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger asChild>
          <Button variant="outline">Right</Button>
        </Popover.Trigger>
        <Popover.Content side="right" className="w-40">
          <div className="text-center">
            <p>This popover appears on the right</p>
          </div>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger asChild>
          <Button variant="outline">Bottom</Button>
        </Popover.Trigger>
        <Popover.Content side="bottom" className="w-40">
          <div className="text-center">
            <p>This popover appears on the bottom</p>
          </div>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger asChild>
          <Button variant="outline">Left</Button>
        </Popover.Trigger>
        <Popover.Content side="left" className="w-40">
          <div className="text-center">
            <p>This popover appears on the left</p>
          </div>
        </Popover.Content>
      </Popover>
    </div>
  ),
};
