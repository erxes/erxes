import { Input, Textarea, cn } from 'erxes-ui';
import { forwardRef, useMemo } from 'react';
import { usePlaceholderInputContext } from '../../contexts/PlaceholderInputContext';
import { PlaceholderInputValuePreview } from './PlaceholderInputValuePreview';

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
  isDragActive?: boolean;
  onDragOver?: (
    e: React.DragEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onDragLeave?: (
    e: React.DragEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onDrop?: (e: React.DragEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

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
      isDragActive,
      onDragOver,
      onDragLeave,
      onDrop,
    },
    ref,
  ) => {
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
        <>
          <PlaceholderInputValuePreview value={value} variant={inputVariant} />
          <Textarea
            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholderText}
            className={cn(
              'relative z-10 bg-transparent pr-10 text-transparent caret-foreground selection:bg-primary/20',
              isDragActive && 'border-primary ring-primary/20 ring-2',
            )}
            disabled={isDisabled}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          />
        </>
      );
    }

    return (
      <>
        <PlaceholderInputValuePreview value={value} variant={inputVariant} />
        <Input
          ref={ref as React.ForwardedRef<HTMLInputElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholderText}
          className={cn(
            'relative z-10 bg-transparent pr-10 text-transparent caret-foreground selection:bg-primary/20',
            isDragActive && 'border-primary ring-primary/20 ring-2',
          )}
          disabled={isDisabled}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />
      </>
    );
  },
);
