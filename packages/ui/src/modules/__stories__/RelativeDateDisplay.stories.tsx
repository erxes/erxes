import { Meta, StoryObj } from '@storybook/react';
import { RelativeDateDisplay } from 'erxes-ui/modules';

const meta: Meta<typeof RelativeDateDisplay> = {
  title: 'Modules/Display/RelativeDate',
  component: RelativeDateDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RelativeDateDisplay>;

export const Default: Story = {
  render: () => {
    const date = new Date(
      new Date().getTime() - 24 * 60 * 60 * 1000,
    ).toISOString();
    return (
      <div className="space-y-4">
        <RelativeDateDisplay value={date}>
          <RelativeDateDisplay.Value value={date} />
        </RelativeDateDisplay>
      </div>
    );
  },
};

export const PastDates: Story = {
  render: () => {
    const now = new Date();

    // Create dates at different points in the past
    const minutesAgo = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago
    const hoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    const lastWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 days ago
    const lastMonth = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000); // 25 days ago
    const lastYear = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000); // ~1 year ago

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Just now (current time)</h3>
          <RelativeDateDisplay value={now.toISOString()}>
            <RelativeDateDisplay.Value value={now.toISOString()} />
          </RelativeDateDisplay>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Minutes ago</h3>
          <RelativeDateDisplay value={minutesAgo.toISOString()}>
            <RelativeDateDisplay.Value value={minutesAgo.toISOString()} />
          </RelativeDateDisplay>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Hours ago</h3>
          <RelativeDateDisplay value={hoursAgo.toISOString()}>
            <RelativeDateDisplay.Value value={hoursAgo.toISOString()} />
          </RelativeDateDisplay>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Yesterday</h3>
          <RelativeDateDisplay value={yesterday.toISOString()}>
            <RelativeDateDisplay.Value value={yesterday.toISOString()} />
          </RelativeDateDisplay>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Last week</h3>
          <RelativeDateDisplay value={lastWeek.toISOString()}>
            <RelativeDateDisplay.Value value={lastWeek.toISOString()} />
          </RelativeDateDisplay>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Last month</h3>
          <RelativeDateDisplay value={lastMonth.toISOString()}>
            <RelativeDateDisplay.Value value={lastMonth.toISOString()} />
          </RelativeDateDisplay>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Last year</h3>
          <RelativeDateDisplay value={lastYear.toISOString()}>
            <RelativeDateDisplay.Value value={lastYear.toISOString()} />
          </RelativeDateDisplay>
        </div>
      </div>
    );
  },
};
