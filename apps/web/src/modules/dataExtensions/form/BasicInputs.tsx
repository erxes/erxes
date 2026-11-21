import { Input, jsonOf, Select, Switch, Textarea, useFormat } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { numberOf, textOfValue, type ValueInputProps } from './inputProps';

/** HTML input types for the text fields that have one. */
const INPUT_TYPES: Record<string, string> = { email: 'email', phone: 'tel', url: 'url' };

/** Text, email, phone and link: one line, cleared when emptied. */
export const TextValueInput = ({ field, value, onChange, id, disabled }: ValueInputProps) => (
  <Input
    id={id}
    type={INPUT_TYPES[field.type] ?? 'text'}
    value={textOfValue(value)}
    placeholder={field.settings.placeholder}
    maxLength={field.settings.maxLength}
    disabled={disabled}
    onChange={(event) => onChange(event.target.value || null)}
  />
);

export const LongTextValueInput = ({ field, value, onChange, id, disabled }: ValueInputProps) => (
  <Textarea
    id={id}
    value={textOfValue(value)}
    placeholder={field.settings.placeholder}
    maxLength={field.settings.maxLength}
    disabled={disabled}
    onChange={(event) => onChange(event.target.value || null)}
  />
);

/**
 * A number or percent as typed: the text stays while it is half typed ("1."), the value is
 * the number it reads as.
 */
export const NumberValueInput = ({ field, value, onChange, id, disabled }: ValueInputProps) => {
  const [text, setText] = useState(typeof value === 'number' ? String(value) : '');
  const { min, max, precision } = field.settings;

  return (
    <Input
      id={id}
      type="number"
      inputMode="decimal"
      value={text}
      min={min}
      max={max}
      step={precision === undefined ? 'any' : 10 ** -precision}
      placeholder={field.settings.placeholder}
      disabled={disabled}
      onChange={(event) => {
        setText(event.target.value);
        onChange(numberOf(event.target.value));
      }}
    />
  );
};

export const BooleanValueInput = ({ value, onChange, id, disabled }: ValueInputProps) => (
  <Switch
    id={id}
    checked={value === true}
    disabled={disabled}
    onCheckedChange={(checked) => onChange(checked)}
  />
);

/** A day (`yyyy-MM-dd`), or a moment: typed in local time, kept as an ISO time with its offset. */
export const DateValueInput = ({ field, value, onChange, id, disabled }: ValueInputProps) => {
  const format = useFormat();
  const withTime = field.type === 'dateTime';
  const text = textOfValue(value);
  const shown = withTime && text ? format.date(text, "yyyy-MM-dd'T'HH:mm") : text;

  return (
    <Input
      id={id}
      type={withTime ? 'datetime-local' : 'date'}
      value={shown}
      disabled={disabled}
      onChange={(event) => {
        const next = event.target.value;

        if (!next) onChange(null);
        else onChange(withTime ? new Date(next).toISOString() : next);
      }}
    />
  );
};

const NONE = 'none';

/** One to `scale` stars (5 unless set). */
export const RatingValueInput = ({ field, value, onChange, id, disabled }: ValueInputProps) => {
  const { t } = useTranslation('data', { keyPrefix: 'form' });
  const scale = field.settings.scale ?? 5;
  const stars = Array.from({ length: scale }, (_, index) => String(index + 1));

  return (
    <Select
      value={typeof value === 'number' ? String(value) : NONE}
      disabled={disabled}
      onValueChange={(next) => onChange(next === NONE ? null : Number(next))}
    >
      <Select.Trigger id={id} variant="bordered">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={NONE}>{t('no-rating', 'No rating')}</Select.Item>
        {stars.map((star) => (
          <Select.Item key={star} value={star}>
            {'★'.repeat(Number(star))}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

const JSON_TEXT = jsonOf(z.json());

/** Any JSON, typed as text: the value changes once the text parses. */
export const JsonValueInput = ({ value, onChange, id, disabled }: ValueInputProps) => {
  const { t } = useTranslation('data', { keyPrefix: 'form' });

  const [text, setText] = useState(
    value === null || value === undefined ? '' : JSON.stringify(value, null, 2),
  );

  const [invalid, setInvalid] = useState(false);

  const change = (next: string) => {
    setText(next);

    const parsed = next.trim() ? JSON_TEXT.safeParse(next) : { success: true, data: null };

    setInvalid(!parsed.success);

    if (parsed.success) onChange(parsed.data);
  };

  return (
    <>
      <Textarea
        id={id}
        value={text}
        aria-invalid={invalid}
        disabled={disabled}
        onChange={(event) => change(event.target.value)}
      />
      {invalid && (
        <p className="text-xs text-destructive-text">{t('invalid-json', 'Not valid JSON yet')}</p>
      )}
    </>
  );
};
