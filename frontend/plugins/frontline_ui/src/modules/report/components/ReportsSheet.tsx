import { Button, Command } from 'erxes-ui';
import { useAtom } from 'jotai';
import { reportSheetOpenState } from '../states';
import { IconDotsVertical } from '@tabler/icons-react';
import {
  REPORT_WIDGET_OPTIONS,
  RESPONSES_CHART_TYPE_OPTIONS,
} from '../constants/modules';

export const ReportsSheet = () => {
  const [isOpen, setIsOpen] = useAtom(reportSheetOpenState);
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  return (
    <div
      data-state={isOpen ? 'open' : 'closed'}
      className="data-[state=open]:animate-in hidden h-full max-w-md w-full data-[state=open]:flex flex-auto shrink-0 flex-col m-3 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    >
      <div className="rounded-lg bg-sidebar flex flex-col h-full w-full p-4">
        <ReportsTypeSelect />
      </div>
    </div>
  );
};

export const ReportsSheetTrigger = () => {
  const [isOpen, setIsOpen] = useAtom(reportSheetOpenState);
  return (
    <Button variant="secondary" onClick={() => setIsOpen(!isOpen)}>
      <IconDotsVertical />
      Options
    </Button>
  );
};

export const ReportsTypeSelect = () => {
  return (
    <Command className="bg-transparent">
      <Command.Input placeholder="Search type" />
      <Command.List>
        {RESPONSES_CHART_TYPE_OPTIONS.map((option) => (
          <Command.Item
            key={option.value}
            value={option.value}
            className="hover:bg-primary/10"
          >
            {option.IconComponent && (
              <option.IconComponent className="size-4" />
            )}
            <span className="text-sm">{option.label}</span>
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const ReportsWidgetSelect = () => {
  return (
    <Command className="bg-transparent">
      <Command.Input placeholder="Search widget" />
      <Command.List>
        {REPORT_WIDGET_OPTIONS.map((option) => (
          <Command.Item
            key={option.value}
            value={option.value}
            className="hover:bg-primary/10"
          >
            <span className="text-sm">{option.label}</span>
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
