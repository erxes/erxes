import { useAutomationStatsWindow } from '@/automations/components/builder/stats/hooks/useAutomationStatsWindow';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Button } from 'erxes-ui';

type AutomationStatsWindowNavProps = Pick<
  ReturnType<typeof useAutomationStatsWindow>,
  | 'beginDate'
  | 'endDate'
  | 'lengthDays'
  | 'isLatest'
  | 'goToPrevious'
  | 'goToNext'
>;

export const AutomationStatsWindowNav = ({
  beginDate,
  endDate,
  lengthDays,
  isLatest,
  goToPrevious,
  goToNext,
}: AutomationStatsWindowNavProps) => (
  <div className="flex items-center gap-1">
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Previous ${lengthDays} days`}
      onClick={goToPrevious}
    >
      <IconChevronLeft />
    </Button>
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">
      {dayjs(beginDate).format('MMM D')} –{' '}
      {dayjs(endDate).format('MMM D, YYYY')}
    </span>
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Next ${lengthDays} days`}
      disabled={isLatest}
      onClick={goToNext}
    >
      <IconChevronRight />
    </Button>
  </div>
);
