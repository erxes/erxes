import {
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const BroadcastCalendarToolbar = ({
  label,
  total,
  loading,
  isCurrentMonth,
  goPrevious,
  goNext,
  goToday,
}: {
  label: string;
  total: number;
  loading: boolean;
  isCurrentMonth: boolean;
  goPrevious: () => void;
  goNext: () => void;
  goToday: () => void;
}) => {
  const { t } = useTranslation('broadcasts');

  return (
    <div className="flex flex-none items-center gap-2 px-3 py-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('calendar.previous-month')}
        onClick={goPrevious}
      >
        <IconChevronLeft />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('calendar.next-month')}
        onClick={goNext}
      >
        <IconChevronRight />
      </Button>

      <h2 className="text-base font-medium">{label}</h2>

      {loading && (
        <IconLoader2 className="size-4 animate-spin text-muted-foreground" />
      )}

      {/* An empty month is ordinary, so it is said quietly rather than drawn as
        an empty state over a grid that is itself the answer. */}
      <span className="text-xs text-muted-foreground">
        {total > 0
          ? t('calendar.sends', { count: total })
          : t('calendar.nothing')}
      </span>

      {/* Only when it has somewhere to go. Sitting there greyed out on the month
        everybody starts on, it read as broken. */}
      {!isCurrentMonth && (
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={goToday}
        >
          {t('calendar.back-to-today')}
        </Button>
      )}
    </div>
  );
};
