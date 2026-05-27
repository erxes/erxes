import {
  Button,
  Popover,
  PopoverScoped,
  ToggleGroup,
  useQueryState,
} from 'erxes-ui';
import {
  IconAdjustmentsHorizontal,
  IconCalendarMonth,
  IconTable,
} from '@tabler/icons-react';
import { useState } from 'react';
import { TourCalendar } from './TourCalendar';
import { TourGroupList } from './TourGroupList';
import { TourRecordTable } from './TourRecordTable';

interface ToursViewControlProps {
  className?: string;
}

export const ToursViewControl = ({ className }: ToursViewControlProps) => {
  const [view, setView] = useQueryState<string | undefined>('view');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost" className={className}>
          <IconAdjustmentsHorizontal />
          View
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <ToggleGroup
          type="single"
          className="grid grid-cols-2 gap-2"
          value={view || 'table'}
          onValueChange={(value) => {
            if (!value) return;
            setView(value === 'table' ? null : value);
            setIsOpen(false);
          }}
        >
          <ToggleGroup.Item value="table" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="flex-col gap-0 h-11"
            >
              <IconTable className="size-5!" />
              <span className="text-xs font-normal">Table</span>
            </Button>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="calendar" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="flex-col gap-0 h-11"
            >
              <IconCalendarMonth className="size-5!" />
              <span className="text-xs font-normal">Calendar</span>
            </Button>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Popover.Content>
    </PopoverScoped>
  );
};

interface ToursViewProps {
  branchId: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}

export const ToursView = ({
  branchId,
  branchLanguages,
  mainLanguage,
}: ToursViewProps) => {
  const [view] = useQueryState<string | undefined>('view');
  const [isGroup] = useQueryState<boolean>('isGroup');

  if (view === 'calendar') {
    return (
      <TourCalendar
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
      />
    );
  }

  if (isGroup) {
    return (
      <TourGroupList
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
      />
    );
  }

  return (
    <TourRecordTable
      branchId={branchId}
      branchLanguages={branchLanguages}
      mainLanguage={mainLanguage}
    />
  );
};
