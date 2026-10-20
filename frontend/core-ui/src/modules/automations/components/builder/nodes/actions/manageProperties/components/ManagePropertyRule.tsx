import { useTranslation } from 'react-i18next';
import {
  describeManagePropertyRule,
  useManagePropertyRule,
} from '@/automations/components/builder/nodes/actions/manageProperties/hooks/useManagePropertyRule';
import { AutomationRuleCard } from '@/automations/components/builder/sidebar/components/content/action/conditional/AutomationRuleCard';
import {
  ManagePropertyCustomInput,
  useManagePropertyCustomInput,
} from '@/automations/components/builder/nodes/actions/manageProperties/components/ManagePropertyCustomInput';
import { IconPlus, IconX } from '@tabler/icons-react';
import { Button, Form, Select } from 'erxes-ui';
import { useState } from 'react';
import {
  AutomationConditionalField,
  PlaceholderInput,
  TPlaceholderInputSuggestion,
} from 'ui-modules';

interface LocalRuleProps {
  id: string;
  index: number;
  onRemove: () => void;
  propertyType: string;
  sourceType: string;
}

export const ManagePropertyRule = ({
  propertyType,
  sourceType,
  id,
  index,
  onRemove,
}: LocalRuleProps) => {
  const {
    form,
    control,
    setValue,
    groups,
    operators,
    handleFieldChange,
    handleUpdate,
    placeholderInputProps,
    rule,
    selectedField,
  } = useManagePropertyRule({ propertyType, sourceType, index });
  const { t } = useTranslation('automations');
  const CustomInput = useManagePropertyCustomInput(propertyType, selectedField);
  // A custom input stores ids, which read as noise in a one-line summary
  const summary = describeManagePropertyRule(rule, operators, !CustomInput);
  const [showFallback, setShowFallback] = useState(
    () => !!String(rule?.fallbackValue ?? '').trim(),
  );

  const handleRemoveFallback = () => {
    setValue(`rules.${index}.fallbackValue`, undefined, { shouldDirty: true });
    setShowFallback(false);
  };

  return (
    <AutomationRuleCard
      id={id}
      title={t('manage-properties-rule', { index: index + 1 })}
      summary={summary}
      onRemove={onRemove}
    >
      <div className="flex flex-row items-end gap-2">
        <Form.Field
          control={control}
          name={`rules.${index}.field`}
          render={({ field }) => (
            <Form.Item className="w-3/5">
              <Form.Label>{t('manage-properties-field')} </Form.Label>

              <Select value={field.value} onValueChange={handleFieldChange}>
                <Select.Trigger>
                  <Select.Value
                    placeholder={t('manage-properties-select-field')}
                  />
                </Select.Trigger>
                <Select.Content>
                  {Object.entries(groups).map(([key, fields], index) => {
                    const groupName =
                      fields.find(({ group }) => group === key)?.groupDetail
                        ?.name || key;

                    return (
                      <div key={index}>
                        <Select.Group>
                          <Select.Label>{groupName}</Select.Label>
                          {fields.map(({ _id, name, label }) => (
                            <Select.Item key={_id} value={name || ''}>
                              {label}
                            </Select.Item>
                          ))}
                        </Select.Group>
                        <Select.Separator />
                      </div>
                    );
                  })}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name={`rules.${index}.operator`}
          render={({ field }) => (
            <Form.Item className="w-2/5">
              <Form.Label>{t('manage-properties-operator')}</Form.Label>

              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value
                    placeholder={t('manage-properties-select-operator')}
                  />
                </Select.Trigger>
                <Select.Content>
                  {operators.map(({ value, label }) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <div>
        <AutomationConditionalField
          form={form}
          names={[`rules.${index}.value`, `rules.${index}.meta`]}
          label={t('value')}
          render={({ field, form: valueForm }) =>
            CustomInput ? (
              <ManagePropertyCustomInput
                CustomInput={CustomInput}
                value={field.value ?? ''}
                onChange={field.onChange}
                meta={valueForm.watch(`rules.${index}.meta`)}
                onMetaChange={(meta) =>
                  valueForm.setValue(`rules.${index}.meta`, meta, {
                    shouldDirty: true,
                  })
                }
                disabled={placeholderInputProps.isDisabled}
              />
            ) : (
              <PlaceholderInput
                propertyType={propertyType}
                value={field.value ?? ''}
                onChange={field.onChange}
                disabled={[TPlaceholderInputSuggestion.Attribute]}
                isExpression={rule.isExpression}
                onChangeInputMode={(mode) =>
                  handleUpdate({ isExpression: mode === 'expression' })
                }
                {...placeholderInputProps}
              >
                <PlaceholderInput.Header />
              </PlaceholderInput>
            )
          }
        />

        {!CustomInput &&
          (showFallback ? (
            <Form.Field
              control={control}
              name={`rules.${index}.fallbackValue`}
              render={({ field }) => (
                <Form.Item className="mt-3">
                  <div className="flex items-center justify-between">
                    <Form.Label>
                      {t('manage-properties-else-description')}
                    </Form.Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={handleRemoveFallback}
                    >
                      <IconX size={14} />
                    </Button>
                  </div>
                  <PlaceholderInput
                    propertyType={propertyType}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    disabled={[TPlaceholderInputSuggestion.Attribute]}
                    {...placeholderInputProps}
                  >
                    <PlaceholderInput.Header />
                  </PlaceholderInput>
                  <Form.Message />
                </Form.Item>
              )}
            />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 text-muted-foreground"
              onClick={() => setShowFallback(true)}
            >
              <IconPlus size={14} />
              {t('manage-properties-else-fallback')}
            </Button>
          ))}
      </div>
    </AutomationRuleCard>
  );
};
