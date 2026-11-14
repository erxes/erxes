import { useTranslation } from 'react-i18next';
import { useManagePropertyRuleCard } from '@/automations/components/builder/nodes/actions/manageProperties/hooks/useManagePropertyRuleCard';
import { AutomationRuleCard } from '@/automations/components/builder/sidebar/components/content/action/conditional/AutomationRuleCard';
import { ManagePropertyCustomInput } from '@/automations/components/builder/nodes/actions/manageProperties/components/ManagePropertyCustomInput';
import { IconPlus, IconX } from '@tabler/icons-react';
import { Button, Form, Select } from 'erxes-ui';
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
  const { t } = useTranslation('automations');
  const {
    form,
    control,
    operators,
    handleFieldChange,
    placeholderInputProps,
    rule,
    CustomInput,
    summary,
    groupOptions,
    showFallbackInput,
    showFallbackButton,
    openFallback,
    removeFallback,
    onInputModeChange,
    metaOf,
    changeMetaOf,
  } = useManagePropertyRuleCard({ propertyType, sourceType, index });

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
                  {groupOptions.map((group) => (
                    <div key={group.key}>
                      <Select.Group>
                        <Select.Label>{group.label}</Select.Label>
                        {group.fields.map(({ _id, name, label }) => (
                          <Select.Item key={_id} value={name || ''}>
                            {label}
                          </Select.Item>
                        ))}
                      </Select.Group>
                      <Select.Separator />
                    </div>
                  ))}
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
                meta={metaOf(valueForm)}
                onMetaChange={changeMetaOf(valueForm)}
                disabled={placeholderInputProps.isDisabled}
              />
            ) : (
              <PlaceholderInput
                propertyType={propertyType}
                value={field.value ?? ''}
                onChange={field.onChange}
                disabled={[TPlaceholderInputSuggestion.Attribute]}
                isExpression={rule.isExpression}
                onChangeInputMode={onInputModeChange}
                {...placeholderInputProps}
              >
                <PlaceholderInput.Header />
              </PlaceholderInput>
            )
          }
        />

        {showFallbackInput && (
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
                    onClick={removeFallback}
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
        )}
        {showFallbackButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 text-muted-foreground"
            onClick={openFallback}
          >
            <IconPlus size={14} />
            {t('manage-properties-else-fallback')}
          </Button>
        )}
      </div>
    </AutomationRuleCard>
  );
};
