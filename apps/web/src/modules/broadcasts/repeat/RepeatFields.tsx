import { RepeatFrequency } from '@erxes/core-contract';
import { Input, Label, Select, ToggleGroup, useFormat } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MONTH_DAYS,
  type RepeatDraft,
  type RepeatEnds,
  WEEKDAYS,
  weekdayDate,
} from './repeatDraft';
import { RepeatPreview } from './RepeatPreview';
import type { RepeatForm } from './useRepeatForm';

type Change = (patch: Partial<RepeatDraft>) => void;

const ENDS: RepeatEnds[] = ['never', 'on', 'after'];

/** "Every [2] [weeks]". */
const EveryField = ({ draft, onChange }: { draft: RepeatDraft; onChange: Change }) => {
  const { t } = useTranslation('broadcasts');
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t('repeat.every', 'Every')}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="number"
          min={1}
          max={99}
          className="w-20"
          value={draft.interval}
          onChange={(event) => onChange({ interval: Math.max(1, Number(event.target.value) || 1) })}
        />
        <Select value={draft.frequency} onValueChange={(frequency) => onChange({ frequency })}>
          <Select.Trigger className="flex-1" aria-label={t('repeat.frequency', 'Repeats')}>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {RepeatFrequency.options.map((frequency) => (
              <Select.Item key={frequency} value={frequency}>
                {t(`repeat.unit.${frequency}`, frequency, { count: draft.interval })}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
    </div>
  );
};

/** Week: which weekdays. Month: which day, the 31st standing for the last day. */
const DayField = ({ draft, onChange }: { draft: RepeatDraft; onChange: Change }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();

  if (draft.frequency === 'week') {
    return (
      <ToggleGroup
        multiple
        variant="outline"
        aria-label={t('repeat.weekdays', 'On these days')}
        value={draft.weekdays.map(String)}
        onValueChange={(days) => onChange({ weekdays: days.map(Number).toSorted((a, b) => a - b) })}
        className="w-full"
      >
        {WEEKDAYS.map((day) => (
          <ToggleGroup.Item key={day} value={String(day)} className="flex-1">
            {fmt.date(weekdayDate(day), 'EEEEEE')}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
    );
  }

  if (draft.frequency !== 'month') return null;

  return (
    <Select
      value={String(draft.dayOfMonth)}
      onValueChange={(day) => onChange({ dayOfMonth: Number(day) })}
    >
      <Select.Trigger aria-label={t('repeat.day-of-month', 'Day of the month')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {MONTH_DAYS.map((day) => (
          <Select.Item key={day} value={String(day)}>
            {day === 31
              ? t('repeat.last-day', 'The last day')
              : t('repeat.month-day', 'Day {{day}}', { day })}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

/** The time of day and the first day, both on the organisation's clock. */
const StartFields = ({ draft, onChange }: { draft: RepeatDraft; onChange: Change }) => {
  const { t } = useTranslation('broadcasts');
  const atId = useId();
  const startId = useId();

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-1.5">
        <Label htmlFor={atId}>{t('repeat.at-label', 'At')}</Label>
        <Input
          id={atId}
          type="time"
          value={draft.at}
          onChange={(event) => onChange({ at: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={startId}>{t('repeat.starts', 'Starts')}</Label>
        <Input
          id={startId}
          type="date"
          value={draft.startsOn}
          onChange={(event) => onChange({ startsOn: event.target.value })}
        />
      </div>
    </div>
  );
};

/** Never, on a date, or after a number of runs. */
const EndFields = ({ draft, onChange }: { draft: RepeatDraft; onChange: Change }) => {
  const { t } = useTranslation('broadcasts');

  return (
    <div className="space-y-1.5">
      <Label>{t('repeat.ends', 'Ends')}</Label>
      <ToggleGroup
        variant="outline"
        value={[draft.ends]}
        onValueChange={([next]) => {
          const ends = ENDS.find((item) => item === next);

          if (ends) onChange({ ends });
        }}
        className="w-full"
      >
        {ENDS.map((ends) => (
          <ToggleGroup.Item key={ends} value={ends} className="flex-1">
            {t(`repeat.ends-${ends}`, ends)}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
      {draft.ends === 'on' && (
        <Input
          type="date"
          aria-label={t('repeat.ends-on-date', 'Last day')}
          value={draft.endsOn}
          min={draft.startsOn}
          onChange={(event) => onChange({ endsOn: event.target.value })}
        />
      )}
      {draft.ends === 'after' && (
        <Input
          type="number"
          min={1}
          max={1000}
          aria-label={t('repeat.ends-after-count', 'Number of runs')}
          value={draft.maxRuns}
          onChange={(event) => onChange({ maxRuns: Math.max(1, Number(event.target.value) || 1) })}
        />
      )}
    </div>
  );
};

/** How a broadcast repeats, and the next times that gives. */
export const RepeatFields = ({ form }: { form: RepeatForm }) => (
  <div className="space-y-3">
    <EveryField draft={form.draft} onChange={form.change} />
    <DayField draft={form.draft} onChange={form.change} />
    <StartFields draft={form.draft} onChange={form.change} />
    <EndFields draft={form.draft} onChange={form.change} />
    <RepeatPreview form={form} />
  </div>
);
