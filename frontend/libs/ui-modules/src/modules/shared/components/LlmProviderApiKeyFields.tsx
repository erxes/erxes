import { IconCheck, IconKey } from '@tabler/icons-react';
import { Form, Input } from 'erxes-ui';
import type { ComponentType } from 'react';
import { Control, FieldPath, FieldValues, useWatch } from 'react-hook-form';

export interface LlmProviderOption {
  value: string;
  label: string;
  defaultModel?: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  imageUrl?: string;
}

interface LlmProviderApiKeyFieldsProps<TFormValues extends FieldValues> {
  control: Control<TFormValues>;
  providerName: FieldPath<TFormValues>;
  apiKeyName: FieldPath<TFormValues>;
  providerOptions: readonly LlmProviderOption[];
  providerLabel?: string;
  apiKeyLabel?: string;
  providerPlaceholder?: string;
  apiKeyPlaceholder?: string;
  disabled?: boolean;
  showApiKey?: boolean;
  onProviderChange?: (provider: string) => void;
}

const getInitials = (label: string) =>
  label
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const LlmProviderApiKeyFields = <TFormValues extends FieldValues>({
  control,
  providerName,
  apiKeyName,
  providerOptions,
  providerLabel = 'Provider',
  apiKeyLabel = 'API key',
  providerPlaceholder = 'Choose provider',
  apiKeyPlaceholder = 'Paste your API key',
  disabled = false,
  showApiKey = true,
  onProviderChange,
}: LlmProviderApiKeyFieldsProps<TFormValues>) => {
  const selectedValue = String(useWatch({ control, name: providerName }) || '');
  const selectedProvider = providerOptions.find(
    ({ value }) => value === selectedValue,
  );

  return (
    <div className="space-y-5">
      <Form.Field
        control={control}
        name={providerName}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{providerLabel}</Form.Label>
            <div
              role="listbox"
              aria-label={providerLabel}
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {providerOptions.map((option) => {
                const selected = option.value === String(field.value || '');
                const ProviderIcon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={disabled}
                    onClick={() => {
                      field.onChange(option.value);
                      onProviderChange?.(option.value);
                    }}
                    className={`relative flex min-h-[76px] items-center gap-3 rounded-md border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-background hover:border-primary/50 hover:bg-muted/40'
                    }`}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-sm font-semibold text-foreground">
                      {option.imageUrl ? (
                        <img
                          src={option.imageUrl}
                          alt=""
                          className="size-6 object-contain"
                        />
                      ) : ProviderIcon ? (
                        <ProviderIcon className="size-5" />
                      ) : (
                        getInitials(option.label)
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                      <span className="block truncate font-mono text-[11px] text-muted-foreground">
                        {option.defaultModel ||
                          option.description ||
                          providerPlaceholder}
                      </span>
                    </span>
                    {selected && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <IconCheck className="size-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <Form.Message />
          </Form.Item>
        )}
      />

      {showApiKey && (
        <Form.Field
          control={control}
          name={apiKeyName}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {selectedProvider
                  ? `${selectedProvider.label} ${apiKeyLabel}`
                  : apiKeyLabel}
              </Form.Label>
              <Form.Control>
                <div className="relative">
                  <IconKey className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    value={String(field.value || '')}
                    type="password"
                    placeholder={apiKeyPlaceholder}
                    className="pl-9"
                    autoComplete="off"
                    disabled={disabled}
                  />
                </div>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};
