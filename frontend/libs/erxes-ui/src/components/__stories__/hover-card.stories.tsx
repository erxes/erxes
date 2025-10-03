import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard } from 'erxes-ui/components/hover-card';
import { Button } from 'erxes-ui/components/button';
import { Avatar } from 'erxes-ui/components/avatar';

const meta: Meta<typeof HoverCard> = {
  title: 'Components/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => {
    return (
      <div className="h-96">
        <HoverCard>
          <HoverCard.Trigger asChild>
            <Button variant="link">@erxes</Button>
          </HoverCard.Trigger>
          <HoverCard.Content className="w-80">
            <div className="flex justify-between space-x-4">
              <Avatar size="xl">
                <Avatar.Image src="https://github.com/erxes.png" />
                <Avatar.Fallback>EX</Avatar.Fallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">@erxes</h4>
                <p className="text-sm">
                  The open-source Hubspot alternative. XOS - Experience
                  Operating System.
                </p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Joined December 2016
                  </span>
                </div>
              </div>
            </div>
          </HoverCard.Content>
        </HoverCard>
      </div>
    );
  },
};
