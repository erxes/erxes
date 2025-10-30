import { Input, Textarea } from 'erxes-ui';
import { forwardRef, useMemo } from 'react';
import { SuggestionConfig, SuggestionType } from '../constants';

interface PlaceholderInputFieldProps {
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
  enabledTypes: Record<SuggestionType, boolean>;
  inputMode: 'expression' | 'fixed';
  suggestionConfigs: SuggestionConfig[];
}

export const PlaceholderInputField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  PlaceholderInputFieldProps
>(
  (
    {
      value,
      onChange,
      onKeyDown,
      onBlur,
      onFocus,
      isDisabled,
      readOnly,
      enabledTypes,
      inputMode,
      suggestionConfigs,
    },
    ref,
  ) => {
    const placeholderText = useMemo(() => {
      const enabledConfigs = suggestionConfigs.filter(
        (config) => enabledTypes[config.type],
      );
      const core = enabledConfigs
        .map((c) => `${c.trigger} for ${c.title.toLowerCase()}`)
        .join(', ');
      return `Type ${core}`;
    }, [enabledTypes, suggestionConfigs]);

    if (inputMode === 'expression') {
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
          readOnly={readOnly}
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
        readOnly={readOnly}
      />
    );
  },
);
