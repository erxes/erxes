import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from '../calendar';
import { addDays } from 'date-fns';

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

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
      to: addDays(new Date(), 7),
    },
  },
};

export const Multiple: Story = {
  args: {
    mode: 'multiple',
    selected: [new Date(), addDays(new Date(), 3), addDays(new Date(), 7)],
  },
};

export const WithDisabledDates: Story = {
  args: {
    mode: 'single',
    selected: new Date(),
    disabled: [{ from: addDays(new Date(), 10), to: addDays(new Date(), 15) }],
  },
};
