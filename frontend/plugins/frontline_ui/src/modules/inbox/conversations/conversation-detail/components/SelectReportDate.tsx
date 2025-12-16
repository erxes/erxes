import { IconChevronDown } from '@tabler/icons-react';
import { Button, cn, Combobox, Command, PopoverScoped } from 'erxes-ui';
import { useRef, useState } from 'react';

const REPORT_DATE_OPTIONS = [
  {
    label: 'All Time',
    value: 'all-time',
  },
  {
    label: 'Today',
    value: 'today',
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
  },
  {
    label: 'This Week',
    value: 'this-week',
  },
  {
    label: 'Last Week',
    value: 'last-week',
  },
  {
    label: 'This Month',
    value: 'this-month',
  },
  {
    label: 'Last Month',
    value: 'last-month',
  },
  {
    label: 'This Year',
    value: 'this-year',
  },
  {
    label: 'Last Year',
    value: 'last-year',
  },
  {
    label: 'Custom Date',
    value: 'custom-date',
  },
];

export const SelectReportDate = () => {
  const [open, setOpen] = useState<boolean>(false);
  const optionRefs = useRef<HTMLDivElement[]>([]);
  const [selected, setSelected] = useState<string>(
    REPORT_DATE_OPTIONS[0].value,
  );

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const handleSelect = (value: string) => {
    setSelected(value);
    setOpen(false);
    optionRefs.current.forEach((ref) => {
      if (ref.textContent === value) {
        ref.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    });
  };
  return (
    <PopoverScoped
      open={open}
      onOpenChange={handleOpenChange}
      scope="report-date"
    >
      <SelectReportDateValue selected={selected} />
      <Combobox.Content align="end" sideOffset={8}>
        <Command>
          <Command.List>
            {REPORT_DATE_OPTIONS.map((option) => (
              <Command.Item
                key={option.value}
                ref={(el) => {
                  if (el) {
                    optionRefs.current.push(el);
                  }
                }}
                value={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onSelect={handleSelect}
                className={cn(selected === option.value && 'text-primary')}
              >
                {option.label}
                <Combobox.Check checked={selected === option.value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};

export const SelectReportDateValue = ({ selected }: { selected: string }) => {
  return (
    <Combobox.TriggerBase
      asChild
      className="w-full h-6 font-medium max-w-28 bg-accent text-xs"
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={(e) => e.stopPropagation()}
      >
        <IconChevronDown />
        {REPORT_DATE_OPTIONS.find((option) => option.value === selected)?.label}
      </Button>
    </Combobox.TriggerBase>
  );
};
