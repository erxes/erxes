import { useState } from 'react';
import { ApolloError } from '@apollo/client';
import {
  Combobox,
  Command,
  PopoverScoped,
  RecordTableInlineCell,
  Spinner,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useReportTranslation } from '@/tunable-reports/locales';

export interface ReferenceOption {
  value: string;
  label: string;
}

export const ReferenceSelect = ({
  scope,
  label,
  value,
  options,
  onChange,
  selectedLabel,
  search,
  loading,
  error,
}: {
  scope: string;
  label: string;
  value: string;
  options: ReferenceOption[];
  onChange: (value: string) => void;
  selectedLabel?: string;
  search?: {
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
  };
  loading?: boolean;
  error?: ApolloError;
}) => {
  const { t } = useReportTranslation();
  const [open, setOpen] = useState(false);
  const display =
    options.find((option) => option.value === value)?.label ?? selectedLabel;
  return (
    <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
      <RecordTableInlineCell.Trigger aria-label={label} className="h-cell">
        <TextOverflowTooltip
          value={display ?? t('select')}
          className={display ? undefined : 'text-muted-foreground'}
        />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Command shouldFilter={!search}>
          <Command.Input
            value={search?.value}
            onValueChange={search?.onChange}
            placeholder={search?.placeholder ?? t('search', { keyPrefix: '' })}
            variant="secondary"
            wrapperClassName="flex-auto"
            focusOnMount
          />
          <Command.List className="max-h-[300px] overflow-y-auto p-1">
            {!loading && (
              <Command.Empty>
                {t('no-results-found', { keyPrefix: '' })}
              </Command.Empty>
            )}
            {error && (
              <p role="alert" className="p-2 text-sm text-destructive">
                {error.message}
              </p>
            )}
            {options.map((option) => (
              <Command.Item
                key={option.value}
                value={`${option.label} ${option.value}`}
                onSelect={() => {
                  if (option.value !== value) onChange(option.value);
                  setOpen(false);
                }}
              >
                <TextOverflowTooltip value={option.label} className="flex-auto" />
                <Combobox.Check checked={option.value === value} />
              </Command.Item>
            ))}
            {loading && <Spinner size="sm" className="my-2" />}
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
