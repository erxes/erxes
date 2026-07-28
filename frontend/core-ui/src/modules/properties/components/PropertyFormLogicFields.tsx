import { IconPlus, IconX } from '@tabler/icons-react';
import { Button, Input, InfoCard, Select, Switch } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IField, useFields } from 'ui-modules';
import { IPropertyForm } from '../types/Properties';

type LogicRule = { field: string; operator: string; value: string; action: string };

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
    (field) => field._id !== excludeFieldId,
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
      logics.map((rule, i) => (i === index ? { ...rule, [key]: value } : rule)),
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
  onChange,
  onRemove,
}: {
  rule: LogicRule;
  availableFields: IField[];
  onChange: (key: 'field' | 'operator' | 'value', value: string) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const targetField = availableFields.find((field) => field._id === rule.field);

  return (
    <div className="flex flex-col gap-2 rounded-md border p-2">
      <div className="flex items-center gap-2">
        <Select
          value={rule.field}
          onValueChange={(value) => onChange('field', value)}
        >
          <Select.Trigger className="flex-1">
            <Select.Value placeholder={t('select-property', 'Select property')} />
          </Select.Trigger>
          <Select.Content>
            {availableFields.map((field) => (
              <Select.Item key={field._id} value={field._id}>
                {field.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
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
        {targetField?.options?.length ? (
          <Select
            value={rule.value}
            onValueChange={(value) => onChange('value', value)}
          >
            <Select.Trigger>
              <Select.Value placeholder={t('value', 'Value')} />
            </Select.Trigger>
            <Select.Content>
              {targetField.options.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        ) : (
          <Input
            value={rule.value}
            onChange={(e) => onChange('value', e.target.value)}
            placeholder={t('value', 'Value')}
          />
        )}
      </div>
    </div>
  );
};
