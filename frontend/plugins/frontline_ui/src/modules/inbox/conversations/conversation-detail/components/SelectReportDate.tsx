import { IconChevronDown } from '@tabler/icons-react';
import { Popover, Button } from 'erxes-ui';
import { useState } from 'react';

const REPORT_DATE_OPTIONS = [
  {
    label: 'All Time',
    value: 'all-time',
  },
  {
    label: 'Last 7 Days',
    value: 'last-7-days',
  },
  {
    label: 'Last 30 Days',
    value: 'last-30-days',
  },
  {
    label: 'Last 90 Days',
    value: 'last-90-days',
  },
  {
    label: 'Last 180 Days',
    value: 'last-180-days',
  },
  {
    label: 'Last 365 Days',
    value: 'last-365-days',
  },
]

export const SelectReportDate = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => e.stopPropagation()}
        >
          <IconChevronDown />
          All Time
        </Button>
      </Popover.Trigger>
    </Popover>
  );
};
