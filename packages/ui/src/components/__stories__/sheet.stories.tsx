import type { Meta, StoryObj } from '@storybook/react';
import { Sheet, Button, Label, Input } from 'erxes-ui/components';

const meta: Meta<typeof Sheet.Content> = {
  title: 'Components/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    side: {
      description: 'The side of the screen to open the sheet from.',
      defaultValue: 'right',
      control: 'select',
      options: ['right', 'bottom', 'left', 'top'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: (args) => (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button variant="outline">Open</Button>
      </Sheet.Trigger>
      <Sheet.Content {...args}>
        <Sheet.Header>
          <Sheet.Title>Edit profile</Sheet.Title>
          <Sheet.Description>
            Make changes to your profile here. Click save when you're done.
          </Sheet.Description>
        </Sheet.Header>
        <div className="">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" value="@peduarte" className="col-span-3" />
            </div>
          </div>
        </div>
        <Sheet.Footer>
          <Sheet.Close>
            <Button type="submit">Save changes</Button>
          </Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  ),
};
