import type { Meta, StoryObj } from '@storybook/react';
import { CommandBar } from 'erxes-ui/components/command-bar';
import { Button } from 'erxes-ui/components/button';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Separator } from 'erxes-ui/components/separator';

const meta: Meta<typeof CommandBar> = {
  title: 'Components/CommandBar',
  component: CommandBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CommandBar>;

export const Default: Story = {
  render: () => {
    return (
      <div className="w-96 h-48">
        <CommandBar open={true}>
          <CommandBar.Bar>
            <CommandBar.Value onClose={() => console.log('close')}>
              24 selected
            </CommandBar.Value>
            <Separator.Inline />
            <Button variant="secondary">
              <IconTrash />
              Delete
            </Button>
            <Button variant="secondary">
              <IconPlus />
              Add
            </Button>
          </CommandBar.Bar>
        </CommandBar>
      </div>
    );
  },
};
