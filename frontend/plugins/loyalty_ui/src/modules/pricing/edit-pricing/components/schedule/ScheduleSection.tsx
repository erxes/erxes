import { Badge, Button } from 'erxes-ui';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { IPricingActiveWindow, PricingScheduleMoment } from '@/pricing/types';
import {
  hasWeekWindows,
  runsPastMidnight,
  wrapsNewYear,
} from '@/pricing/utils/schedule';
import { useScheduleEditor } from '@/pricing/hooks/useScheduleEditor';
import { useScheduleWindowLabel } from '@/pricing/hooks/useScheduleWindowLabel';
import { ScheduleWindowSheet } from './ScheduleWindowSheet';
import { ScheduleWeekGrid } from './ScheduleWeekGrid';
import { ScheduleClosedDates } from './ScheduleClosedDates';
import { ScheduleMomentSelect } from './ScheduleMomentSelect';
import { ScheduleCheck } from './ScheduleCheck';

interface ScheduleSectionProps {
  windows: IPricingActiveWindow[];
  closedDates: string[];
  scheduleMoment: PricingScheduleMoment;
  onWindowsChange: (windows: IPricingActiveWindow[]) => void;
  onClosedDatesChange: (dates: string[]) => void;
  onScheduleMomentChange: (moment: PricingScheduleMoment) => void;
  // Public and base prices are written ahead of time, so they cannot follow a clock.
  blockedByPriority: boolean;
}

export const ScheduleSection = ({
  windows,
  closedDates,
  scheduleMoment,
  onWindowsChange,
  onClosedDatesChange,
  onScheduleMomentChange,
  blockedByPriority,
}: ScheduleSectionProps) => {
  const { t } = useTranslation('loyalty');
  const editor = useScheduleEditor({ windows, onWindowsChange });
  const label = useScheduleWindowLabel();

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t('schedule-description')}
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={blockedByPriority}
          onClick={editor.startAdd}
        >
          <IconPlus size={16} />
          {t('schedule-add-window')}
        </Button>
      </div>

      {blockedByPriority && (
        <p className="px-3 py-2 text-sm rounded-md bg-warning/10 text-warning">
          {t('schedule-blocked-by-priority')}
        </p>
      )}

      {windows.length === 0 ? (
        <div className="py-6 text-sm text-center text-muted-foreground">
          {t('schedule-empty')}
        </div>
      ) : (
        <div className="border divide-y rounded-lg">
          {windows.map((window, index) => (
            <div
              key={`${index}-${window.type}-${window.startTime}`}
              className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm"
            >
              <Badge>{label.type(window)}</Badge>
              {label.days(window) && <span>{label.days(window)}</span>}
              <span className="font-mono">{label.time(window)}</span>
              {runsPastMidnight(window) && (
                <Badge variant="info">{t('schedule-next-day')}</Badge>
              )}
              {wrapsNewYear(window) && (
                <Badge variant="info">{t('schedule-wraps-year')}</Badge>
              )}

              <div className="flex gap-1 ml-auto">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  aria-label={t('schedule-edit-window')}
                  onClick={() => editor.startEdit(index)}
                >
                  <IconEdit size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  className="text-destructive"
                  aria-label={t('schedule-remove-window')}
                  onClick={() => editor.remove(index)}
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasWeekWindows(windows) && <ScheduleWeekGrid windows={windows} />}

      {(windows.length > 0 || closedDates.length > 0) && (
        <ScheduleClosedDates
          dates={closedDates}
          onChange={onClosedDatesChange}
        />
      )}

      {windows.length > 0 && (
        <>
          <ScheduleMomentSelect
            value={scheduleMoment}
            onChange={onScheduleMomentChange}
          />
          <ScheduleCheck
            windows={windows}
            closedDates={closedDates}
            scheduleMoment={scheduleMoment}
          />
        </>
      )}

      <ScheduleWindowSheet
        open={editor.open}
        window={editor.editingWindow}
        onOpenChange={(open) => !open && editor.close()}
        onSave={editor.save}
      />
    </section>
  );
};
