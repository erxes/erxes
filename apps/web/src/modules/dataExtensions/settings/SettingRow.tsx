import { IconPicker, Input, Label, Select, Switch, Textarea } from 'erxes-ui';
import { type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';

/** A labelled control of a settings form, with an optional line under it. */
export const SettingRow = ({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

/** An icon to pick, then the row it names (a label's input). */
export const IconRow = ({
  icon,
  onIconChange,
  children,
}: {
  icon: string | null;
  onIconChange: (icon: string | null) => void;
  children: ReactNode;
}) => (
  <div className="flex items-end gap-3">
    <div className="flex-none">
      <IconPicker
        value={icon ?? undefined}
        onValueChange={onIconChange}
        variant="outline"
        size="icon"
      />
    </div>
    {children}
  </div>
);

/** A key (what the API names it by) and a description, as objects and fields both take them. */
export const KeyAndDescription = ({
  keyValue,
  keyHint,
  keyLocked,
  description,
  onKeyChange,
  onDescriptionChange,
}: {
  keyValue: string;
  keyHint: string;
  /** The key can't change any more. */
  keyLocked?: boolean;
  description: string;
  onKeyChange: (key: string) => void;
  onDescriptionChange: (description: string) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'model' });
  const keyId = useId();
  const descriptionId = useId();

  return (
    <>
      <SettingRow label={t('key', 'Key')} htmlFor={keyId} hint={keyHint}>
        <Input
          id={keyId}
          value={keyValue}
          disabled={keyLocked}
          onChange={({ target }) => onKeyChange(target.value)}
        />
      </SettingRow>
      <SettingRow label={t('description', 'Description')} htmlFor={descriptionId}>
        <Textarea
          id={descriptionId}
          value={description}
          onChange={({ target }) => onDescriptionChange(target.value)}
        />
      </SettingRow>
    </>
  );
};

/** A labelled pick of one of `options`. */
export const SelectRow = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) => {
  const id = useId();

  return (
    <SettingRow label={label} htmlFor={id}>
      <Select value={value} onValueChange={onChange}>
        <Select.Trigger id={id} variant="bordered">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </SettingRow>
  );
};

/** An on or off setting: its switch, then what it does. */
export const SwitchRow = ({
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  const id = useId();

  return (
    <div className="flex items-start gap-3">
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
      <div className="flex flex-col gap-1">
        <Label htmlFor={id} variant="plain">
          {label}
        </Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
};
