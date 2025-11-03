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
>(
  (
    { value, onChange, onKeyDown, onBlur, onFocus, isDisabled, readOnly },
    ref,
  ) => {
    const { enabledTypes, inputVariant, suggestionConfigs } =
      usePlaceholderInputContext();
    const placeholderText = useMemo(() => {
      const enabledConfigs = suggestionConfigs.filter(
        (config) => enabledTypes[config.type as SuggestionType],
      );
      const core = enabledConfigs
        .map((c) => `${c.trigger} for ${c.title.toLowerCase()}`)
        .join(', ');
      return `Type ${core}`;
    }, [enabledTypes, suggestionConfigs]);

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
