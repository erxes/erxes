import { Input, Textarea } from 'erxes-ui';
import { forwardRef, useMemo } from 'react';
import { usePlaceholderInputContext } from '../../contexts/PlaceholderInputContext';
import { SuggestionType } from '../../types/placeholderInputTypes';

type PlaceholderInputFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onFocus?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  isDisabled?: boolean;
  readOnly?: boolean;
};

export const PlaceholderInputField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  PlaceholderInputFieldProps
>(({ value, onChange, onKeyDown, onBlur, onFocus, isDisabled }, ref) => {
  const { enabledTypes, inputVariant, suggestions } =
    usePlaceholderInputContext();
  const placeholderText = useMemo(() => {
    const core = suggestions
      .map((c) => `${c.trigger} for ${c.title.toLowerCase()}`)
      .join(', ');
    return `Type ${core}`;
  }, [enabledTypes, suggestions]);

  if (inputVariant === 'expression') {
    return (
      <Textarea
        ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholderText}
        className="pr-10"
        disabled={isDisabled}
      />
    );
  }

  return (
    <Input
      ref={ref as React.ForwardedRef<HTMLInputElement>}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={placeholderText}
      className="pr-10"
      disabled={isDisabled}
    />
  );
});
