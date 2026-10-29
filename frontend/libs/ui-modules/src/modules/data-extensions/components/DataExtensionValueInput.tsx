import {
  Checkbox,
  cn,
  DatePicker,
  Input,
  Label,
  Select,
  Textarea,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { DataExtensionValue, IDataExtensionField } from '../types';
import { PANEL_INPUT_CLASS_NAME } from '../../widget/record-side-panel/PanelForm';
import {
  AddressInput,
  CurrencyInput,
  DateTimeInput,
  FilesInput,
  FullNameInput,
  JsonInput,
  LinksInput,
  MemberInput,
  RatingInput,
  StringListInput,
} from './DataExtensionCompositeInputs';
import { OptionColorDot } from './DataExtensionOptionBadge';

const NOT_SET = '__not_set__';

const inputTypes: Partial<Record<IDataExtensionField['type'], string>> = {
  email: 'email',
  url: 'url',
  phone: 'tel',
  number: 'number',
};

/**
 * One editor per field type; an empty editor means the value is cleared.
 * `compact` sizes the editors like the record side panel's own fields.
 */
export const DataExtensionValueInput = ({
  field,
  id,
  value,
  onChange,
  compact = false,
}: {
  field: IDataExtensionField;
  id: string;
  value: DataExtensionValue;
  onChange: (value: DataExtensionValue) => void;
  compact?: boolean;
}) => {
  const { t } = useTranslation('dataExtensions');
  const inputClassName = compact ? PANEL_INPUT_CLASS_NAME : undefined;
  const triggerClassName = compact
    ? 'h-7 rounded-sm text-xs shadow-none'
    : undefined;

  const composite = {
    field,
    id,
    value,
    onChange,
    compact,
    inputClassName,
  };

  switch (field.type) {
    case 'currency':
      return <CurrencyInput {...composite} />;
    case 'address':
      return <AddressInput {...composite} />;
    case 'fullName':
      return <FullNameInput {...composite} />;
    case 'links':
      return <LinksInput {...composite} />;
    case 'emails':
    case 'phones':
      return <StringListInput {...composite} />;
    case 'files':
      return <FilesInput {...composite} />;
    case 'rating':
      return <RatingInput {...composite} />;
    case 'dateTime':
      return <DateTimeInput {...composite} />;
    case 'member':
      return <MemberInput {...composite} />;
    case 'json':
      return <JsonInput {...composite} />;
    case 'percent':
      return (
        <div className="relative">
          <Input
            id={id}
            className={cn('pr-7', inputClassName)}
            type="number"
            inputMode="decimal"
            placeholder={field.settings?.placeholder}
            value={typeof value === 'number' ? String(value) : ''}
            onChange={(event) => {
              const next = event.target.value;
              onChange(next === '' ? null : Number(next));
            }}
          />
          <span
            className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-muted-foreground"
            aria-hidden="true"
          >
            %
          </span>
        </div>
      );
    case 'longText':
      return (
        <Textarea
          id={id}
          rows={3}
          className={cn(compact && 'min-h-16 rounded-sm text-xs shadow-none')}
          placeholder={field.settings?.placeholder}
          maxLength={field.settings?.maxLength}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value || null)}
        />
      );
    case 'number':
      return (
        <Input
          id={id}
          className={inputClassName}
          type="number"
          inputMode="decimal"
          min={field.settings?.min}
          max={field.settings?.max}
          placeholder={field.settings?.placeholder}
          value={typeof value === 'number' ? String(value) : ''}
          onChange={(event) => {
            const next = event.target.value;
            onChange(next === '' ? null : Number(next));
          }}
        />
      );
    case 'boolean':
      return (
        <Select
          value={typeof value === 'boolean' ? String(value) : NOT_SET}
          onValueChange={(next) =>
            onChange(next === NOT_SET ? null : next === 'true')
          }
        >
          <Select.Trigger id={id} className={triggerClassName}>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={NOT_SET}>{t('values.not-set')}</Select.Item>
            <Select.Item value="true">{t('values.yes')}</Select.Item>
            <Select.Item value="false">{t('values.no')}</Select.Item>
          </Select.Content>
        </Select>
      );
    case 'date':
      return (
        <DatePicker
          className={triggerClassName}
          value={typeof value === 'string' ? new Date(value) : undefined}
          placeholder={t('values.pick-date')}
          allowNull
          onChange={(next) =>
            onChange(next instanceof Date ? next.toISOString() : null)
          }
        />
      );
    case 'select':
      return (
        <Select
          value={typeof value === 'string' ? value : NOT_SET}
          onValueChange={(next) => onChange(next === NOT_SET ? null : next)}
        >
          <Select.Trigger id={id} className={triggerClassName}>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={NOT_SET}>{t('values.not-set')}</Select.Item>
            {(field.options || []).map((option) => (
              <Select.Item key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  <OptionColorDot color={option.color} />
                  {option.label}
                </span>
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      );
    case 'multiSelect': {
      const selected = Array.isArray(value) ? value : [];

      return (
        <div
          id={id}
          role="group"
          className={cn(
            'flex flex-wrap gap-x-4 gap-y-2 rounded-md border p-3',
            compact && 'gap-x-3 gap-y-1.5 rounded-sm p-2 text-xs',
          )}
        >
          {(field.options || []).map((option) => {
            const optionId = `${id}-${option.value}`;
            const checked = selected.includes(option.value);

            return (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={optionId}
                  checked={checked}
                  onCheckedChange={(next) => {
                    const values = next
                      ? [...selected, option.value]
                      : selected.filter((item) => item !== option.value);
                    onChange(values.length ? values : null);
                  }}
                />
                <Label
                  htmlFor={optionId}
                  className="flex items-center gap-1.5 font-normal"
                >
                  <OptionColorDot color={option.color} />
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
      );
    }
    default:
      return (
        <Input
          id={id}
          className={inputClassName}
          type={inputTypes[field.type] || 'text'}
          placeholder={field.settings?.placeholder}
          maxLength={field.settings?.maxLength}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value || null)}
        />
      );
  }
};
