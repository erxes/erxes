import { IconFilter, IconPlus, IconX } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Label,
  Popover,
  Select,
} from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataExtensionFilterOperator,
  DataExtensionRecordPicker,
  DataExtensionValue,
  DataExtensionValueInput,
  filterOperatorsFor,
  IDataExtensionField,
  IDataExtensionFilter,
  IDataExtensionFilterCondition,
  IDataExtensionRecordType,
} from 'ui-modules';

/** Native fields custom object records can be filtered on. */
const nativeFields = (t: (key: string) => string): IDataExtensionField[] =>
  (
    [
      ['name', 'text', t('records.name')],
      ['createdAt', 'dateTime', t('records.created')],
      ['updatedAt', 'dateTime', t('records.updated')],
    ] as const
  ).map(([key, type, label]) => ({
    _id: `native-${key}`,
    recordType: '',
    key,
    label,
    type,
    order: 0,
    status: 'active',
  }));

const NO_VALUE: DataExtensionFilterOperator[] = ['isEmpty', 'isNotEmpty'];

const ConditionValue = ({
  field,
  condition,
  onChange,
}: {
  field: IDataExtensionField;
  condition: IDataExtensionFilterCondition;
  onChange: (value: unknown) => void;
}) => {
  const { t } = useTranslation('dataExtensions');
  const id = useId();

  if (NO_VALUE.includes(condition.operator)) {
    return null;
  }

  if (condition.operator === 'in' || condition.operator === 'nin') {
    const selected = Array.isArray(condition.value) ? (condition.value as string[]) : [];

    return (
      <div role="group" aria-label={field.label} className="flex flex-wrap gap-x-3 gap-y-1.5">
        {(field.options || []).map((option) => (
          <div key={option.value} className="flex items-center gap-1.5">
            <Checkbox
              id={`${id}-${option.value}`}
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...selected, option.value]
                    : selected.filter((value) => value !== option.value),
                )
              }
            />
            <Label
              htmlFor={`${id}-${option.value}`}
              className="text-xs font-normal normal-case tracking-normal"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    );
  }

  if (field.relation) {
    return (
      <DataExtensionRecordPicker
        id={id}
        recordType={field.relation.targetRecordType}
        known={[]}
        mode="single"
        value={typeof condition.value === 'string' ? condition.value : undefined}
        onChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
      />
    );
  }

  if (field.type === 'currency' || field.type === 'rating' || field.type === 'percent') {
    return (
      <Input
        type="number"
        inputMode="decimal"
        aria-label={t('filters.value')}
        placeholder={field.type === 'currency' ? t('filters.amount') : undefined}
        value={typeof condition.value === 'number' ? String(condition.value) : ''}
        onChange={(event) =>
          onChange(event.target.value === '' ? undefined : Number(event.target.value))
        }
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <Select
        value={condition.value === false ? 'false' : 'true'}
        onValueChange={(next) => onChange(next === 'true')}
      >
        <Select.Trigger aria-label={t('filters.value')}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="true">{t('values.yes')}</Select.Item>
          <Select.Item value="false">{t('values.no')}</Select.Item>
        </Select.Content>
      </Select>
    );
  }

  // Text-like comparisons take free text even on composite types.
  const textual = condition.operator === 'contains' || condition.operator === 'notContains';

  return (
    <DataExtensionValueInput
      id={id}
      field={
        textual
          ? { ...field, type: 'text', settings: {} }
          : { ...field, settings: { ...field.settings, multiple: false } }
      }
      value={(condition.value ?? null) as DataExtensionValue}
      onChange={(value) => onChange(value ?? undefined)}
    />
  );
};

/**
 * Conditions on a custom object's records. Only operators the field type
 * supports are offered; the server checks them again with the values.
 */
export const DataExtensionFilterBuilder = ({
  recordType,
  fields,
  filter,
  onChange,
}: {
  recordType: IDataExtensionRecordType;
  fields: IDataExtensionField[];
  filter: IDataExtensionFilter;
  onChange: (filter: IDataExtensionFilter) => void;
}) => {
  const { t } = useTranslation('dataExtensions');
  const choices = [
    ...(recordType.custom ? nativeFields(t) : []),
    ...fields.filter((field) => filterOperatorsFor(field).length),
  ];
  const byKey = new Map(choices.map((field) => [field.key, field]));
  const conditions = filter.conditions;
  const active = conditions.length;

  const update = (index: number, next: Partial<IDataExtensionFilterCondition>) =>
    onChange({
      ...filter,
      conditions: conditions.map((condition, i) =>
        i === index ? { ...condition, ...next } : condition,
      ),
    });

  const add = () => {
    const field = choices[0];

    if (!field) {
      return;
    }

    onChange({
      ...filter,
      conditions: [
        ...conditions,
        { field: field.key, operator: filterOperatorsFor(field)[0] },
      ],
    });
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant={active ? 'secondary' : 'outline'}>
          <IconFilter />
          {t('filters.title')}
          {active > 0 && (
            <Badge variant="secondary" className="ml-0.5 tabular-nums">
              {active}
            </Badge>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="start" className="w-[min(36rem,calc(100vw-2rem))] p-3">
        <div className="flex flex-col gap-3">
          {conditions.length > 1 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {t('filters.match')}
              <Select
                value={filter.match || 'all'}
                onValueChange={(match) => onChange({ ...filter, match: match as 'all' | 'any' })}
              >
                <Select.Trigger className="h-7 w-28 text-xs" aria-label={t('filters.match')}>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">{t('filters.all')}</Select.Item>
                  <Select.Item value="any">{t('filters.any')}</Select.Item>
                </Select.Content>
              </Select>
              {t('filters.of-these')}
            </div>
          )}
          {!conditions.length && (
            <p className="text-sm text-muted-foreground">{t('filters.empty')}</p>
          )}
          {conditions.map((condition, index) => {
            const field = byKey.get(condition.field);
            const operators = field ? filterOperatorsFor(field) : [];

            return (
              <div key={index} className="grid grid-cols-[minmax(0,9rem)_minmax(0,9rem)_minmax(0,1fr)_auto] items-start gap-1.5">
                <Select
                  value={condition.field}
                  onValueChange={(key) => {
                    const next = byKey.get(key);

                    update(index, {
                      field: key,
                      operator: next ? filterOperatorsFor(next)[0] : 'isNotEmpty',
                      value: undefined,
                    });
                  }}
                >
                  <Select.Trigger aria-label={t('filters.field')}>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {choices.map((choice) => (
                      <Select.Item key={choice.key} value={choice.key}>
                        {choice.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Select
                  value={condition.operator}
                  onValueChange={(operator) =>
                    update(index, {
                      operator: operator as DataExtensionFilterOperator,
                      ...(NO_VALUE.includes(operator as DataExtensionFilterOperator)
                        ? { value: undefined }
                        : {}),
                    })
                  }
                >
                  <Select.Trigger aria-label={t('filters.operator')}>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {operators.map((operator) => (
                      <Select.Item key={operator} value={operator}>
                        {t(`filters.operators.${operator}`)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <div className="min-w-0">
                  {field && (
                    <ConditionValue
                      field={field}
                      condition={condition}
                      onChange={(value) => update(index, { value })}
                    />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('filters.remove')}
                  onClick={() =>
                    onChange({
                      ...filter,
                      conditions: conditions.filter((_, i) => i !== index),
                    })
                  }
                >
                  <IconX />
                </Button>
              </div>
            );
          })}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={add} disabled={conditions.length >= 20}>
              <IconPlus />
              {t('filters.add')}
            </Button>
            {conditions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => onChange({ match: 'all', conditions: [] })}
              >
                {t('filters.clear')}
              </Button>
            )}
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
};

/** Conditions complete enough to send: a value where the operator needs one. */
export const readyConditions = (filter: IDataExtensionFilter): IDataExtensionFilter => ({
  match: filter.match || 'all',
  conditions: filter.conditions.filter(
    (condition) =>
      NO_VALUE.includes(condition.operator) ||
      (condition.value !== undefined &&
        condition.value !== null &&
        condition.value !== '' &&
        !(Array.isArray(condition.value) && !condition.value.length)),
  ),
});
