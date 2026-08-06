import React from 'react';
import { DatePicker } from 'erxes-ui';
import { format } from 'date-fns';

interface Props {
  fromDate?: string;
  toDate?: string;
  onChange: (from: string, to: string) => void;
}

export const DateRangePicker: React.FC<Props> = ({ fromDate, toDate, onChange }) => {
  const handleFromChange = (date: any) => {
    if (date && !Array.isArray(date) && date instanceof Date) {
      const newFrom = format(date, 'yyyy-MM-dd');
      const newTo = toDate || format(new Date(), 'yyyy-MM-dd');
      onChange(newFrom, newTo);
    }
  };

  const handleToChange = (date: any) => {
    if (date && !Array.isArray(date) && date instanceof Date) {
      const newFrom = fromDate || format(new Date(), 'yyyy-MM-dd');
      const newTo = format(date, 'yyyy-MM-dd');
      onChange(newFrom, newTo);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DatePicker
        value={fromDate ? new Date(fromDate) : undefined}
        onChange={handleFromChange}
        placeholder="From"
      />
      <span className="text-gray-500">–</span>
      <DatePicker
        value={toDate ? new Date(toDate) : undefined}
        onChange={handleToChange}
        placeholder="To"
      />
    </div>
  );
};