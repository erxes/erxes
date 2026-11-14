import {
  cn,
  DateInput,
  DatePicker,
  Label,
  TimeField,
  ToggleGroup,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastScheduleFields } from '../../hooks/useBroadcastScheduleFields';
import { TBroadcastScheduleForm } from '../../utils/scheduleForm';

/**
 * One schedule: how often, when, and until when.
 *
 * Shared by the dialog the list opens and the popover the form carries, so a
 * schedule is described the same way wherever it is offered.
 */
export const BroadcastScheduleFields = ({
  value,
  onChange,
  canFollowSegment = false,
}: {
  value: TBroadcastScheduleForm;
  onChange: (next: TBroadcastScheduleForm) => void;
  /** The audience is one segment the clock moves, so it can start the send. */
  canFollowSegment?: boolean;
}) => {
  const { t } = useTranslation('broadcasts');
  const {
    at,
    time,
    recurring,
    afterSegment,
    options,
    asGrid,
    atLabelKey,
    recurrenceText,
    sendCount,
    isInPast,
    onEveryChange,
    onDateChange,
    onTimeChange,
    onEndDateChange,
  } = useBroadcastScheduleFields({ value, onChange, canFollowSegment });

  return (
    <div className="w-72 space-y-3">
      <ToggleGroup
        type="single"
        value={value.every}
        onValueChange={onEveryChange}
        className={cn('w-full', asGrid && 'grid grid-cols-3')}
      >
        {options.map((option) => (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            className="flex-1"
          >
            {t(option.labelKey)}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>

      {afterSegment && (
        <p className="text-xs text-muted-foreground">
          {t('schedule.after-segment-hint')}
        </p>
      )}

      {!afterSegment && (
        <div className="space-y-1">
          <Label>{t(atLabelKey)}</Label>
          <div className="flex items-center gap-2">
            <DatePicker value={at} defaultMonth={at} onChange={onDateChange} />
            <div className="w-24">
              <TimeField value={time} onChange={onTimeChange}>
                <DateInput />
              </TimeField>
            </div>
          </div>
        </div>
      )}

      {recurring && (
        <div className="space-y-1">
          <Label>{t('schedule.until')}</Label>
          <DatePicker
            value={value.endDate}
            defaultMonth={value.endDate ?? at}
            placeholder={t('schedule.pick-end')}
            onChange={onEndDateChange}
          />
        </div>
      )}

      {recurring && (
        <p className="text-xs text-muted-foreground">
          {recurrenceText}
          {sendCount !== undefined && (
            <>
              {' · '}
              <span className="text-foreground">
                {t('schedule.times', { count: sendCount })}
              </span>
            </>
          )}
        </p>
      )}

      {isInPast && (
        <p className="text-xs text-destructive">{t('schedule.in-past')}</p>
      )}
    </div>
  );
};
