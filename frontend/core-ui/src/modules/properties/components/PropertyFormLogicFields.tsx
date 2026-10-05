import { IconPlus, IconX } from '@tabler/icons-react';
import { Button, Input, InfoCard, Select, Switch } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IField, useFields } from 'ui-modules';
import { IPropertyForm } from '../types/Properties';
import { PropertyLogicFieldSelect } from './PropertyLogicFieldSelect';

// "is / is not" means nothing for these, so they cannot drive logic.
const NON_COMPARABLE_TYPES = new Set([
  'date',
  'file',
  'relation',
  'list',
  'objectList',
  'editor',
]);

type LogicRule = {
  field: string;
  operator: string;
  value: string;
  action: string;
};

const DEFAULT_RULE: LogicRule = {
  field: '',
  operator: 'is',
  value: '',
  action: 'show',
};

export const PropertyFormLogicFields = ({
  form,
  contentType,
  excludeFieldId,
}: {
  form: UseFormReturn<IPropertyForm>;
  contentType: string;
  excludeFieldId?: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { fields: siblingFields } = useFields({ contentType });
  const availableFields = siblingFields.filter(
    (field) =>
      field._id !== excludeFieldId && !NON_COMPARABLE_TYPES.has(field.type),
  );

  const logics = (form.watch('logics') || []) as LogicRule[];
  const logicEnabled = logics.length > 0;
  const action = logics[0]?.action === 'hide' ? 'hide' : 'show';

  const setLogics = (next: LogicRule[]) =>
    form.setValue('logics', next, { shouldDirty: true });

  const handleEnableToggle = (checked: boolean) => {
    setLogics(checked ? [{ ...DEFAULT_RULE }] : []);
  };

  const handleActionChange = (value: string) => {
    setLogics(logics.map((rule) => ({ ...rule, action: value })));
  };

  const handleAddRule = () => {
    setLogics([...logics, { ...DEFAULT_RULE, action }]);
  };

  const handleChangeRule = (
    index: number,
    key: 'field' | 'operator' | 'value',
    value: string,
  ) => {
    setLogics(
      logics.map((rule, i) => {
        if (i !== index) {
          return rule;
        }

        // A value means nothing once the rule points at another field.
        return key === 'field'
          ? { ...rule, field: value, value: '' }
          : { ...rule, [key]: value };
      }),
    );
  };

  const handleRemoveRule = (index: number) => {
    setLogics(logics.filter((_, i) => i !== index));
  };

  return (
    <InfoCard title={t('logic', 'Logic')}>
      <InfoCard.Content>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">
              {t('enable-logic', 'Enable logic')}
            </span>
            <span className="text-xs text-muted-foreground">
              {t(
                'logic-description',
                'Create rules to show or hide this element depending on the values of other properties.',
              )}
            </span>
          </div>
          <Switch checked={logicEnabled} onCheckedChange={handleEnableToggle} />
        </div>
        {logicEnabled && (
          <div className="flex flex-col gap-3">
            <Select value={action} onValueChange={handleActionChange}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="show">
                  {t('show-this-field', 'Show this field')}
                </Select.Item>
                <Select.Item value="hide">
                  {t('hide-this-field', 'Hide this field')}
                </Select.Item>
              </Select.Content>
            </Select>
            <div className="flex flex-col gap-2">
              {logics.map((rule, index) => (
                <LogicRuleRow
                  key={index}
                  rule={rule}
                  availableFields={availableFields}
                  contentType={contentType}
                  onChange={(key, value) => handleChangeRule(index, key, value)}
                  onRemove={() => handleRemoveRule(index)}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="self-start"
              onClick={handleAddRule}
            >
              <IconPlus />
              {t('add-logic-rule', 'Add logic rule')}
            </Button>
          </div>
        )}
      </InfoCard.Content>
    </InfoCard>
  );
};

const LogicRuleRow = ({
  rule,
  availableFields,
  contentType,
  onChange,
  onRemove,
}: {
  rule: LogicRule;
  availableFields: IField[];
  contentType: string;
  onChange: (key: 'field' | 'operator' | 'value', value: string) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const targetField = availableFields.find((field) => field._id === rule.field);

  return (
    <div className="flex flex-col gap-2 rounded-md border p-2">
      <div className="flex items-center gap-2">
        <PropertyLogicFieldSelect
          value={rule.field}
          onValueChange={(value) => onChange('field', value)}
          fields={availableFields}
          contentType={contentType}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-none hover:text-destructive"
          onClick={onRemove}
        >
          <IconX />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={rule.operator}
          onValueChange={(value) => onChange('operator', value)}
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="is">{t('is', 'is')}</Select.Item>
            <Select.Item value="isNot">{t('is-not', 'is not')}</Select.Item>
          </Select.Content>
        </Select>
        <LogicValueInput
          field={targetField}
          value={rule.value}
          onChange={(value) => onChange('value', value)}
        />
      </div>
    </div>
  );
};

type TValueOption = { label: string; value: string };

const ValueSelect = ({
  options,
  value,
  onChange,
}: {
  options: TValueOption[];
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  return (
    <Select value={value} onValueChange={onChange}>
      <Select.Trigger>
        <Select.Value placeholder={t('value', 'Value')} />
      </Select.Trigger>
      <Select.Content>
        {options.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

// Rules compare the string of what a field stores, so the editor writes exactly that.
const LogicValueInput = ({
  field,
  value,
  onChange,
}: {
  field?: IField;
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  if (field?.options?.length) {
    return (
      <ValueSelect options={field.options} value={value} onChange={onChange} />
    );
  }

  if (field?.type === 'boolean') {
    return (
      <ValueSelect
        options={[
          { label: t('true', 'True'), value: 'true' },
          { label: t('false', 'False'), value: 'false' },
        ]}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <Input
      type={field?.type === 'number' ? 'number' : 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('value', 'Value')}
    />
  );
};
