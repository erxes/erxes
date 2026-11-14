import { Badge, Input, Label, Select, Switch, Textarea } from 'erxes-ui';
import { useId, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DATA_EXTENSION_FORMULA_RESULT_TYPES,
  DATA_EXTENSION_ROLLUP_OPS,
  DataExtensionFieldType,
  IDataExtensionFieldSettings,
  isComputedField,
  useDataExtensionFields,
} from 'ui-modules';

const NUMERIC_TYPES: DataExtensionFieldType[] = ['number', 'currency', 'percent', 'rating'];
const NONE = '__none__';

type Settings = IDataExtensionFieldSettings;

/**
 * Expression and result type for formulas; relation, total and field for
 * rollups. Only valid choices are offered; the server checks again.
 */
export const DataExtensionComputedSettings = ({
  type,
  recordType,
  fieldKey,
  settings,
  onChange,
}: {
  type: DataExtensionFieldType;
  recordType: string;
  fieldKey: string;
  settings: Settings;
  onChange: (settings: Settings) => void;
}) => {
  const { t } = useTranslation('dataExtensions');
  const { fields } = useDataExtensionFields({ recordType });
  const expressionRef = useRef<HTMLTextAreaElement>(null);
  const expressionId = useId();
  const stored = useMemo(
    () =>
      fields.filter(
        (field) => !isComputedField(field) && !field.relation && field.key !== fieldKey,
      ),
    [fields, fieldKey],
  );
  const listRelations = fields.filter(
    (field) =>
      field.relation &&
      (field.relation.kind === 'manyToMany' ||
        (field.relation.side === 'inverse' && field.relation.kind === 'manyToOne')),
  );
  const rollup = settings.rollup;
  const relation = listRelations.find((field) => field.key === rollup?.relation);
  const { fields: targetFields } = useDataExtensionFields({
    recordType: relation?.relation?.targetRecordType,
  });
  const numericTargets = targetFields.filter((field) => NUMERIC_TYPES.includes(field.type));

  if (type === 'formula') {
    const insert = (key: string) => {
      const element = expressionRef.current;
      const current = settings.expression || '';
      const token = `{${key}}`;
      const start = element?.selectionStart ?? current.length;
      const end = element?.selectionEnd ?? current.length;

      onChange({ ...settings, expression: current.slice(0, start) + token + current.slice(end) });
      requestAnimationFrame(() => {
        element?.focus();
        element?.setSelectionRange(start + token.length, start + token.length);
      });
    };

    return (
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">{t('computed.formula')}</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={expressionId} className="text-xs">
            {t('computed.expression')}
          </Label>
          <Textarea
            id={expressionId}
            ref={expressionRef}
            rows={3}
            spellCheck={false}
            className="font-mono text-sm"
            placeholder='IF({status} == "signed", {value}, 0)'
            value={settings.expression || ''}
            onChange={(event) => onChange({ ...settings, expression: event.target.value })}
          />
          {stored.length > 0 && (
            <div className="flex flex-wrap gap-1" aria-label={t('computed.insert-field')}>
              {stored.map((field) => (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => insert(field.key)}
                  className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Badge variant="secondary" className="cursor-pointer font-mono text-xs">
                    {`{${field.key}}`}
                  </Badge>
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">{t('computed.expression-hint')}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">{t('computed.result-type')}</Label>
          <Select
            value={settings.resultType || 'number'}
            onValueChange={(resultType) =>
              onChange({ ...settings, resultType: resultType as Settings['resultType'] })
            }
          >
            <Select.Trigger aria-label={t('computed.result-type')}>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {DATA_EXTENSION_FORMULA_RESULT_TYPES.map((result) => (
                <Select.Item key={result} value={result}>
                  {t(`computed.results.${result}`)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      </fieldset>
    );
  }

  if (type !== 'rollup') {
    return null;
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-medium">{t('computed.rollup')}</legend>
      {!listRelations.length ? (
        <p className="text-sm text-muted-foreground">{t('computed.no-relations')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('computed.relation')}</Label>
            <Select
              value={rollup?.relation || NONE}
              onValueChange={(key) =>
                onChange({
                  ...settings,
                  rollup: { relation: key, op: rollup?.op || 'count' },
                })
              }
            >
              <Select.Trigger aria-label={t('computed.relation')}>
                <Select.Value placeholder={t('computed.pick')} />
              </Select.Trigger>
              <Select.Content>
                {listRelations.map((field) => (
                  <Select.Item key={field.key} value={field.key}>
                    {field.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('computed.op')}</Label>
            <Select
              value={rollup?.op || 'count'}
              disabled={!rollup?.relation}
              onValueChange={(op) =>
                rollup &&
                onChange({
                  ...settings,
                  rollup: {
                    relation: rollup.relation,
                    op: op as NonNullable<Settings['rollup']>['op'],
                    ...(op === 'count' ? {} : { field: rollup.field }),
                  },
                })
              }
            >
              <Select.Trigger aria-label={t('computed.op')}>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {DATA_EXTENSION_ROLLUP_OPS.map((op) => (
                  <Select.Item key={op} value={op}>
                    {t(`computed.ops.${op}`)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          {rollup && rollup.op !== 'count' && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">{t('computed.of-field')}</Label>
              <Select
                value={rollup.field || NONE}
                onValueChange={(field) => onChange({ ...settings, rollup: { ...rollup, field } })}
              >
                <Select.Trigger aria-label={t('computed.of-field')}>
                  <Select.Value placeholder={t('computed.pick')} />
                </Select.Trigger>
                <Select.Content>
                  {numericTargets.map((field) => (
                    <Select.Item key={field.key} value={field.key}>
                      {field.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          )}
        </div>
      )}
    </fieldset>
  );
};

/** Who sees and edits the value, and when forms show it. */
export const DataExtensionAccessSettings = ({
  recordType,
  fieldKey,
  settings,
  onChange,
}: {
  recordType: string;
  fieldKey: string;
  settings: Settings;
  onChange: (settings: Settings) => void;
}) => {
  const { t } = useTranslation('dataExtensions');
  const { fields } = useDataExtensionFields({ recordType });
  const restrictedId = useId();
  const readOnlyId = useId();
  const rule = settings.visibleWhen;
  const ruleFields = fields.filter(
    (field) =>
      field.key !== fieldKey &&
      !isComputedField(field) &&
      ['select', 'multiSelect', 'boolean', 'text', 'number'].includes(field.type),
  );
  const ruleField = ruleFields.find((field) => field.key === rule?.field);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium">{t('access.title')}</legend>
      <div className="flex items-start justify-between gap-4 rounded-md border p-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor={restrictedId} className="text-sm font-medium">
            {t('access.managers')}
          </Label>
          <p className="text-xs text-muted-foreground">{t('access.managers-hint')}</p>
        </div>
        <Switch
          id={restrictedId}
          checked={settings.access === 'managers'}
          onCheckedChange={(checked) =>
            onChange({ ...settings, access: checked ? 'managers' : undefined })
          }
        />
      </div>
      <div className="flex items-start justify-between gap-4 rounded-md border p-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor={readOnlyId} className="text-sm font-medium">
            {t('access.read-only')}
          </Label>
          <p className="text-xs text-muted-foreground">{t('access.read-only-hint')}</p>
        </div>
        <Switch
          id={readOnlyId}
          checked={Boolean(settings.readOnly)}
          onCheckedChange={(checked) => onChange({ ...settings, readOnly: checked || undefined })}
        />
      </div>
      {ruleFields.length > 0 && (
        <div className="flex flex-col gap-2 rounded-md border p-3">
          <Label className="text-sm font-medium">{t('access.show-when')}</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Select
              value={rule?.field || NONE}
              onValueChange={(field) =>
                onChange({
                  ...settings,
                  visibleWhen: field === NONE ? undefined : { field, operator: 'isNotEmpty' },
                })
              }
            >
              <Select.Trigger aria-label={t('access.show-when-field')}>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value={NONE}>{t('access.always')}</Select.Item>
                {ruleFields.map((field) => (
                  <Select.Item key={field.key} value={field.key}>
                    {field.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            {rule && ruleField && (
              <>
                <Select
                  value={rule.operator}
                  onValueChange={(operator) =>
                    onChange({
                      ...settings,
                      visibleWhen: {
                        field: rule.field,
                        operator: operator as NonNullable<Settings['visibleWhen']>['operator'],
                        ...(operator === 'isNotEmpty' ? {} : { value: rule.value }),
                      },
                    })
                  }
                >
                  <Select.Trigger aria-label={t('filters.operator')}>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {(['eq', 'neq', 'isNotEmpty'] as const).map((operator) => (
                      <Select.Item key={operator} value={operator}>
                        {t(`filters.operators.${operator}`)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                {rule.operator !== 'isNotEmpty' &&
                  (ruleField.options?.length ? (
                    <Select
                      value={typeof rule.value === 'string' ? rule.value : NONE}
                      onValueChange={(value) =>
                        onChange({ ...settings, visibleWhen: { ...rule, value } })
                      }
                    >
                      <Select.Trigger aria-label={t('filters.value')}>
                        <Select.Value placeholder={t('computed.pick')} />
                      </Select.Trigger>
                      <Select.Content>
                        {ruleField.options.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  ) : ruleField.type === 'boolean' ? (
                    <Select
                      value={rule.value === false ? 'false' : 'true'}
                      onValueChange={(value) =>
                        onChange({ ...settings, visibleWhen: { ...rule, value: value === 'true' } })
                      }
                    >
                      <Select.Trigger aria-label={t('filters.value')}>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="true">{t('values.yes')}</Select.Item>
                        <Select.Item value="false">{t('values.no')}</Select.Item>
                      </Select.Content>
                    </Select>
                  ) : (
                    <Input
                      aria-label={t('filters.value')}
                      value={rule.value === undefined ? '' : String(rule.value)}
                      onChange={(event) =>
                        onChange({
                          ...settings,
                          visibleWhen: {
                            ...rule,
                            value:
                              ruleField.type === 'number'
                                ? Number(event.target.value)
                                : event.target.value,
                          },
                        })
                      }
                    />
                  ))}
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t('access.show-when-hint')}</p>
        </div>
      )}
    </fieldset>
  );
};
