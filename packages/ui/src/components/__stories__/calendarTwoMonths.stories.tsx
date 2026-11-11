import type { Meta, StoryObj } from '@storybook/react';
import { CalendarTwoMonths } from 'erxes-ui/components/calendar';
import { addDays } from 'date-fns';

const meta: Meta<typeof CalendarTwoMonths> = {
  title: 'Components/CalendarTwoMonths',
  component: CalendarTwoMonths,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CalendarTwoMonths>;

export const Default: Story = {
  args: {
    mode: 'single',
    selected: new Date(),
  },
};

export const Range: Story = {
  args: {
    mode: 'range',
    selected: {
      from: new Date(),
      to: addDays(new Date(), 14),
    },
  },
};

export const Multiple: Story = {
  args: {
    mode: 'multiple',
    selected: [new Date(), addDays(new Date(), 5), addDays(new Date(), 10)],
  },
};

export const WithDisabledDates: Story = {
  args: {
    mode: 'single',
    selected: new Date(),
    disabled: [{ from: addDays(new Date(), 10), to: addDays(new Date(), 15) }],
  },
};
