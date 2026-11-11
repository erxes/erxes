/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from 'erxes-ui/components/date-picker';
import { useState } from 'react';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
      <div className="w-72">
        <DatePicker
          value={date}
          onChange={(date) => setDate(date as Date)}
          placeholder="Select date"
        />
      </div>
    );
  },
};

export const WithPastDatesOnly: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
      <div className="w-72">
        <DatePicker
          value={date}
          onChange={(date) => setDate(date as Date)}
          withPresent={true}
          placeholder="Select past date"
        />
      </div>
    );
  },
};

export const MultipleSelection: Story = {
  render: () => {
    const [dates, setDates] = useState<Date[]>([]);

    return (
      <div className="w-72">
        <DatePicker
          value={dates}
          onChange={(selected) => setDates(selected as Date[])}
          mode="multiple"
          placeholder="Select multiple dates"
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
      <div className="w-72">
        <DatePicker
          value={date}
          onChange={(date) => setDate(date as Date)}
          disabled={true}
          placeholder="Disabled date picker"
        />
      </div>
    );
  },
};
