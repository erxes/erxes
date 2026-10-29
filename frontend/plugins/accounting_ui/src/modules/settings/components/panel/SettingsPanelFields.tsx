import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Switch, TextField, Textarea } from 'erxes-ui';
import { PANEL_TEXT_FIELD_CLASS_NAME } from 'ui-modules';
import {
  SETTINGS_PANEL_SELECT_ITEM_CLASS_NAME,
  SETTINGS_PANEL_SELECT_TRIGGER_CLASS_NAME,
} from '@/settings/constants/settingsPanel';

export const SettingsPanelSelect = <T extends string>({
  value,
  options,
  placeholder,
  onValueChange,
  className = SETTINGS_PANEL_SELECT_TRIGGER_CLASS_NAME,
}: {
  value?: string;
  options: { value: T; label: string }[];
  placeholder: string;
  onValueChange: (value: T) => void;
  className?: string;
}) => (
  <Select
    value={value || ''}
    onValueChange={(next) => next !== value && onValueChange(next as T)}
  >
    <Select.Trigger className={className}>
      <Select.Value placeholder={placeholder} />
    </Select.Trigger>
    <Select.Content align="start">
      {options.map((option) => (
        <Select.Item
          key={option.value}
          value={option.value}
          className={SETTINGS_PANEL_SELECT_ITEM_CLASS_NAME}
        >
          {option.label}
        </Select.Item>
      ))}
    </Select.Content>
  </Select>
);

export const SettingsPanelSwitch = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <div className="flex h-7 items-center px-2">
    <Switch size="sm" checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export const SettingsPanelTextField = ({
  scope,
  value,
  placeholder,
  onSave,
}: {
  scope: string;
  value: string;
  placeholder?: string;
  onSave: (value: string) => void;
}) => (
  <TextField
    scope={scope}
    value={value}
    placeholder={placeholder}
    className={PANEL_TEXT_FIELD_CLASS_NAME}
    onSave={(next) => next !== value && onSave(next)}
  />
);

export const SettingsPanelNumberField = ({
  scope,
  value,
  min,
  max,
  placeholder,
  onSave,
}: {
  scope: string;
  value?: number | null;
  min?: number;
  max?: number;
  placeholder?: string;
  onSave: (value: number) => void;
}) => (
  <SettingsPanelTextField
    scope={scope}
    value={value === undefined || value === null ? '' : String(value)}
    placeholder={placeholder}
    onSave={(next) => {
      const parsed = Number(next);

      if (
        !next.trim() ||
        Number.isNaN(parsed) ||
        (min !== undefined && parsed < min) ||
        (max !== undefined && parsed > max)
      ) {
        return;
      }

      onSave(parsed);
    }}
  />
);

const SettingsPanelTextarea = ({
  value,
  className,
  onChange,
  onBlur,
}: {
  value: string;
  className: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <div className="flex flex-col gap-1.5 pt-2">
      <span className="text-xs font-medium text-accent-foreground">
        {t('description')}
      </span>
      <Textarea
        value={value}
        placeholder={t('enter-description-label')}
        className={className}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
    </div>
  );
};

export const SettingsPanelDescriptionInput = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) => (
  <SettingsPanelTextarea
    value={value ?? ''}
    className="h-28 min-h-28 resize-none rounded-md shadow-xs"
    onChange={onChange}
  />
);

export const SettingsPanelDescriptionField = ({
  value,
  onSave,
}: {
  value: string;
  onSave: (value: string) => void;
}) => {
  const [draft, setDraft] = useState(value);

  return (
    <SettingsPanelTextarea
      value={draft}
      className="min-h-20 resize-none rounded-sm shadow-none hover:bg-accent focus-visible:bg-background focus-visible:shadow-focus"
      onChange={setDraft}
      onBlur={() => draft !== value && onSave(draft)}
    />
  );
};
