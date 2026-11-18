import type { ComponentPropsWithoutRef } from 'react';
import type { DateRange, Matcher, PropsBase } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import type { DatePickerMode, DatePickerValue } from './date-picker-value';
import { useFieldControl } from './field-control';
import type { Popover } from './popover';

export type SelectedDates = Date | Date[] | DateRange;

/**
 * What names the field and says its state. They go on the text input or the trigger, which
 * people reach, not on the calendar; `Form.Control` and a form row set them too.
 */
type DateControlProps = {
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
};

export type DatePickerProps = {
  value?: DatePickerValue;
  onChange: (date?: SelectedDates | null) => void;
  placeholder?: string;
  withPresent?: boolean;
  minDate?: Date;
  maxDate?: Date;
  mode?: DatePickerMode;
  formatMultiple?: (count: number) => string;
  variant?: 'outline' | 'default' | 'ghost';
  allowNull?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  calendarClassName?: string;
  popoverContentProps?: ComponentPropsWithoutRef<typeof Popover.Content>;
  inline?: boolean;
  disabled?: Matcher | Matcher[];
} & DateControlProps &
  Omit<PropsBase, 'mode' | 'required' | 'disabled' | keyof DateControlProps>;

/** The field's own naming props over its form row's (`useFieldControl`). */
const useDateControl = (own: DateControlProps): DateControlProps => {
  const field = useFieldControl();

  return {
    ...field,
    id: own.id,
    'aria-label': own['aria-label'],
    // A field's own aria-label names it; the row's label would win over it.
    'aria-labelledby':
      own['aria-labelledby'] ?? (own['aria-label'] ? undefined : field['aria-labelledby']),
    'aria-describedby': own['aria-describedby'] ?? field['aria-describedby'],
    'aria-invalid': own['aria-invalid'] ?? field['aria-invalid'],
  };
};

/** The words the picker shows when the caller gives none, in the UI's language. */
const useDefaultText = () => {
  const { t } = useTranslation('ui', { keyPrefix: 'date' });

  return {
    placeholder: t('placeholder', 'Pick a date'),
    clearLabel: t('clear', 'Clear'),
    formatMultiple: (count: number) =>
      t('days', { count, defaultValue_one: '{{count}} day', defaultValue_other: '{{count}} days' }),
  };
};

/** The props with their defaults; the naming props go to the field, what is left to the calendar. */
export const useResolvedProps = ({
  value,
  onChange,
  placeholder,
  withPresent = false,
  minDate,
  maxDate,
  disabled,
  className,
  mode = 'single',
  formatMultiple,
  variant = 'outline',
  allowNull,
  clearable = allowNull ?? true,
  clearLabel,
  calendarClassName,
  popoverContentProps,
  inline = false,
  defaultMonth,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...calendarProps
}: DatePickerProps) => {
  const text = useDefaultText();

  const control = useDateControl({
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  });

  return {
    value,
    onChange,
    placeholder: placeholder ?? text.placeholder,
    withPresent,
    minDate,
    maxDate,
    disabled,
    className,
    mode,
    formatMultiple: formatMultiple ?? text.formatMultiple,
    variant,
    clearable,
    clearLabel: clearLabel ?? text.clearLabel,
    calendarClassName,
    popoverContentProps,
    inline,
    defaultMonth,
    control,
    // With no field to reach, the inline calendar is what the name is for.
    calendarProps:
      inline && mode !== 'single'
        ? {
            ...calendarProps,
            'aria-label': control['aria-label'],
            'aria-labelledby': control['aria-labelledby'],
          }
        : calendarProps,
  };
};
