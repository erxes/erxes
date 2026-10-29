import { Input, Label, Select, Switch } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DATA_EXTENSION_CURRENCIES,
  DATA_EXTENSION_DECIMAL_TYPES,
  DATA_EXTENSION_LENGTH_TYPES,
  DATA_EXTENSION_NO_DEFAULT_TYPES,
  DATA_EXTENSION_RANGE_TYPES,
  DATA_EXTENSION_UNIQUE_TYPES,
  DataExtensionFieldType,
  DataExtensionValue,
  DataExtensionValueInput,
  IDataExtensionFieldOption,
  IDataExtensionFieldSettings,
} from 'ui-modules';

const PLACEHOLDER_TYPES: DataExtensionFieldType[] = [
  'text',
  'longText',
  'number',
  'email',
  'url',
  'phone',
  'currency',
  'percent',
  'member',
];

const NOT_SET = '__not_set__';

/** Drops unset values so only chosen settings are sent. */
export const cleanFieldSettings = (
  settings: IDataExtensionFieldSettings,
): IDataExtensionFieldSettings =>
  Object.fromEntries(
    Object.entries(settings).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(typeof value === 'number' && Number.isNaN(value)),
    ),
  );

const SettingSwitch = ({
  label,
  hint,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => {
  const id = useId();

  return (
    <div className="flex items-start justify-between gap-4 rounded-md border p-3">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
};

const NumberSetting = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value?: number;
  onChange: (value?: number) => void;
  min?: number;
  max?: number;
  step?: number | 'any';
}) => {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step ?? 'any'}
        value={value === undefined ? '' : String(value)}
        onChange={(event) =>
          onChange(
            event.target.value === '' ? undefined : Number(event.target.value),
          )
        }
      />
    </div>
  );
};

/**
 * Rules and display options of one field. Only settings that apply to the
 * type are offered; the server checks the same rules again.
 */
export const DataExtensionFieldSettings = ({
  type,
  settings,
  options,
  isEdit,
  initialSettings,
  onChange,
}: {
  type: DataExtensionFieldType;
  settings: IDataExtensionFieldSettings;
  options: IDataExtensionFieldOption[];
  isEdit: boolean;
  /** Settings the field was saved with; fixed ones stay as they were. */
  initialSettings?: IDataExtensionFieldSettings | null;
  onChange: (settings: IDataExtensionFieldSettings) => void;
}) => {
  const { t } = useTranslation('dataExtensions');
  const set = <K extends keyof IDataExtensionFieldSettings>(
    key: K,
    value: IDataExtensionFieldSettings[K],
  ) => onChange({ ...settings, [key]: value });
  const groupId = useId();
  const placeholderId = useId();
  const defaultId = useId();

  if (type === 'relation') {
    return null;
  }

  const canBeUnique = (DATA_EXTENSION_UNIQUE_TYPES as readonly string[]).includes(
    type,
  );
  const hasRange = DATA_EXTENSION_RANGE_TYPES.includes(type);
  const hasLength = DATA_EXTENSION_LENGTH_TYPES.includes(type);
  const hasDecimals = DATA_EXTENSION_DECIMAL_TYPES.includes(type);
  const hasDefault = !DATA_EXTENSION_NO_DEFAULT_TYPES.includes(type);
  const uniqueLocked = isEdit && !initialSettings?.unique;

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">
          {t('settings.rules')}
        </legend>
        <SettingSwitch
          label={t('settings.required')}
          hint={t('settings.required-hint')}
          checked={Boolean(settings.required)}
          onCheckedChange={(checked) => set('required', checked || undefined)}
        />
        {canBeUnique && (
          <SettingSwitch
            label={t('settings.unique')}
            hint={t(uniqueLocked ? 'settings.unique-locked' : 'settings.unique-hint')}
            checked={Boolean(settings.unique)}
            disabled={uniqueLocked}
            onCheckedChange={(checked) =>
              set('unique', isEdit ? checked : checked || undefined)
            }
          />
        )}
        {type === 'member' && (
          <SettingSwitch
            label={t('settings.multiple')}
            hint={t(isEdit ? 'settings.multiple-locked' : 'settings.multiple-hint')}
            checked={Boolean(settings.multiple)}
            disabled={isEdit}
            onCheckedChange={(checked) => set('multiple', checked || undefined)}
          />
        )}
        {(hasRange || hasLength || type === 'rating' || hasDecimals) && (
          <div className="grid grid-cols-2 gap-3 rounded-md border p-3">
            {hasRange && (
              <>
                <NumberSetting
                  label={t('settings.min')}
                  value={settings.min}
                  onChange={(value) => set('min', value)}
                />
                <NumberSetting
                  label={t('settings.max')}
                  value={settings.max}
                  onChange={(value) => set('max', value)}
                />
              </>
            )}
            {hasLength && (
              <NumberSetting
                label={t('settings.max-length')}
                value={settings.maxLength}
                min={1}
                step={1}
                onChange={(value) => set('maxLength', value)}
              />
            )}
            {type === 'rating' && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">{t('settings.scale')}</Label>
                <Select
                  value={String(settings.scale || 5)}
                  onValueChange={(next) => set('scale', Number(next))}
                >
                  <Select.Trigger aria-label={t('settings.scale')}>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((scale) => (
                      <Select.Item key={scale} value={String(scale)}>
                        {t('settings.scale-stars', { count: scale })}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            )}
            {hasDecimals && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">{t('settings.precision')}</Label>
                <Select
                  value={
                    settings.precision === undefined
                      ? NOT_SET
                      : String(settings.precision)
                  }
                  onValueChange={(next) =>
                    set('precision', next === NOT_SET ? undefined : Number(next))
                  }
                >
                  <Select.Trigger aria-label={t('settings.precision')}>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value={NOT_SET}>
                      {t('settings.precision-auto')}
                    </Select.Item>
                    {[0, 1, 2, 3, 4, 5, 6].map((digits) => (
                      <Select.Item key={digits} value={String(digits)}>
                        {digits}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            )}
          </div>
        )}
        {type === 'currency' && (
          <div className="flex flex-col gap-1.5 rounded-md border p-3">
            <Label className="text-xs">{t('settings.currency')}</Label>
            <Select
              value={settings.currency || 'MNT'}
              onValueChange={(next) => set('currency', next)}
            >
              <Select.Trigger aria-label={t('settings.currency')}>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {DATA_EXTENSION_CURRENCIES.map((code) => (
                  <Select.Item key={code} value={code}>
                    {code}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">
          {t('settings.display')}
        </legend>
        {hasDefault && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={defaultId} className="text-xs">
              {t('settings.default-value')}
            </Label>
            <DataExtensionValueInput
              id={defaultId}
              field={{
                _id: 'default',
                recordType: '',
                key: 'defaultValue',
                label: t('settings.default-value'),
                type,
                options,
                settings,
                order: 0,
                status: 'active',
              }}
              value={(settings.defaultValue ?? null) as DataExtensionValue}
              onChange={(value) => set('defaultValue', value ?? undefined)}
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.default-value-hint')}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={groupId} className="text-xs">
              {t('settings.group')}
            </Label>
            <Input
              id={groupId}
              maxLength={60}
              placeholder={t('settings.group-placeholder')}
              value={settings.group || ''}
              onChange={(event) =>
                set('group', event.target.value || undefined)
              }
            />
          </div>
          {PLACEHOLDER_TYPES.includes(type) && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={placeholderId} className="text-xs">
                {t('settings.placeholder')}
              </Label>
              <Input
                id={placeholderId}
                maxLength={120}
                value={settings.placeholder || ''}
                onChange={(event) =>
                  set('placeholder', event.target.value || undefined)
                }
              />
            </div>
          )}
        </div>
        <SettingSwitch
          label={t('settings.show-in-create')}
          hint={t('settings.show-in-create-hint')}
          checked={settings.showInCreate !== false}
          onCheckedChange={(checked) =>
            set('showInCreate', checked ? undefined : false)
          }
        />
      </fieldset>
    </div>
  );
};
