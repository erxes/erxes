import type { Meta, StoryObj } from '@storybook/react';
import {
  IconCalendar,
  IconHome,
  IconInbox,
  IconSearch,
  IconSettings,
} from '@tabler/icons-react';
import { Sidebar, Button, Label, Input } from 'erxes-ui/components';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const items = [
  {
    title: 'Home',
    url: '#',
    icon: IconHome,
  },
  {
    title: 'Inbox',
    url: '#',
    icon: IconInbox,
  },
  {
    title: 'Calendar',
    url: '#',
    icon: IconCalendar,
  },
  {
    title: 'Search',
    url: '#',
    icon: IconSearch,
  },
  {
    title: 'Settings',
    url: '#',
    icon: IconSettings,
  },
];

export const Default: Story = {
  render: (args) => (
    <div className="h-96 w-full">
      <Sidebar.Provider>
        <Sidebar {...args} className="h-full">
          <Sidebar.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Erxes UI</h2>
              <Sidebar.Trigger />
            </div>
            <Sidebar.Input placeholder="Search..." />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  {items.map((item) => (
                    <Sidebar.MenuItem key={item.title}>
                      <Sidebar.MenuButton
                        tooltip={item.title}
                        isActive={item.title === 'Home'}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                  ))}
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary"></div>
                <div>
                  <p className="text-sm font-medium">User Name</p>
                  <p className="text-xs text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <IconSettings size={16} />
              </Button>
            </div>
          </Sidebar.Footer>
          <Sidebar.Rail />
        </Sidebar>
      </Sidebar.Provider>
    </div>
  ),
};
