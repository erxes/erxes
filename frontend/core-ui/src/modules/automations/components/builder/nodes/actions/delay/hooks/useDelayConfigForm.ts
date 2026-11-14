import { useDelay } from '@/automations/components/builder/nodes/actions/delay/hooks/useDelay';
import { TDelayConfigForm } from '@/automations/components/builder/nodes/actions/delay/states/delayConfigForm';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type TDelayPreset = {
  label: string;
  value: string;
  type: TDelayConfigForm['type'];
};

export const QUICK_PRESETS: TDelayPreset[] = [
  { label: '5 min', value: '5', type: 'minute' },
  { label: '15 min', value: '15', type: 'minute' },
  { label: '1 hour', value: '1', type: 'hour' },
  { label: '6 hours', value: '6', type: 'hour' },
  { label: '1 day', value: '1', type: 'day' },
  { label: '1 week', value: '7', type: 'day' },
];

// [singular, plural] translation keys per unit
const UNIT_KEYS: Record<
  NonNullable<TDelayConfigForm['type']>,
  [string, string]
> = {
  minute: ['minute', 'minutes'],
  hour: ['hour', 'hours'],
  day: ['day', 'days'],
  month: ['month', 'months'],
  year: ['year', 'years'],
};

const DIRTY = { shouldDirty: true, shouldTouch: true };

/**
 * The delay form as drawn: a one-line summary of the wait, the preset that
 * matches it, and applying a preset in one click.
 */
export const useDelayConfigForm = (config: TDelayConfigForm) => {
  const { t } = useTranslation('automations');
  const delay = useDelay(config);
  const { form, value, type = 'day', workingTime } = delay;
  const selectedValue = value || '1';

  const unitLabelOf = () => {
    const [singular, plural] = UNIT_KEYS[type] || UNIT_KEYS.day;
    const key = Number(selectedValue) === 1 ? singular : plural;

    return t(key, { defaultValue: key });
  };

  const duration = `${selectedValue} ${unitLabelOf()}`;
  const summary = workingTime
    ? `${duration} · ${t('delay-working-hours-short', {
        defaultValue: 'working hours',
      })}`
    : duration;

  const presets = QUICK_PRESETS.map((preset) => ({
    ...preset,
    isSelected: selectedValue === preset.value && type === preset.type,
  }));

  const applyPreset = useCallback(
    (preset: TDelayPreset) => {
      form.setValue('value', preset.value, DIRTY);
      form.setValue('type', preset.type, DIRTY);
    },
    [form],
  );

  return { ...delay, summary, presets, applyPreset };
};

export const branchIdOf = (value: unknown) => (value as string) || undefined;
