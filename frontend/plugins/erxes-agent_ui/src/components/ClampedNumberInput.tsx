import { useEffect, useState } from 'react';
import { Input } from 'erxes-ui';

type NumberField = {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
};

/**
 * Number input bound to a numeric form field. The text being edited lives in
 * local state so the box can be cleared mid-type without ever writing
 * `undefined`/`NaN` into the field: the field only takes valid parses while
 * typing, and the value is clamped to `min`–`max` (or `fallback` when empty)
 * on blur.
 */
export const ClampedNumberInput = ({
  field,
  min,
  max,
  fallback,
  id,
  className,
}: {
  field: NumberField;
  min: number;
  max: number;
  fallback: number;
  id?: string;
  className?: string;
}) => {
  const [text, setText] = useState(String(field.value));

  // Re-sync when the field changes from outside (form reset, blur clamp), but
  // not while the user is typing a value that already parses to field.value.
  useEffect(() => {
    if (parseInt(text, 10) !== field.value) setText(String(field.value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value]);

  return (
    <Input
      id={id}
      type="number"
      min={min}
      max={max}
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n)) field.onChange(n);
      }}
      onBlur={() => {
        const n = parseInt(text, 10);
        const clamped = Number.isNaN(n)
          ? fallback
          : Math.min(max, Math.max(min, n));
        setText(String(clamped));
        field.onChange(clamped);
        field.onBlur?.();
      }}
      className={className}
    />
  );
};
