import { useManagePropertyRule } from '@/automations/components/builder/nodes/actions/manageProperties/hooks/useManagePropertyRule';
import {
  ManagePropertyCustomInput,
  useManagePropertyCustomInput,
} from '@/automations/components/builder/nodes/actions/manageProperties/components/ManagePropertyCustomInput';
import { IconCornerDownRight, IconTrash, IconX } from '@tabler/icons-react';
import { Button, Form, Select } from 'erxes-ui';
import { useState } from 'react';
import { PlaceholderInput, TPlaceholderInputSuggestion } from 'ui-modules';
import { useTranslation } from 'react-i18next';

interface LocalRuleProps {
  index: number;
  propertyType: string;
  sourceType: string;
}

export const ManagePropertyRule = ({
  propertyType,
  sourceType,
  index,
}: LocalRuleProps) => {
  const { t } = useTranslation('automations');
  const {
    control,
    setValue,
    groups,
    operators,
    handleFieldChange,
    handleRemove,
    handleUpdate,
    placeholderInputProps,
    rule,
    selectedField,
  } = useManagePropertyRule({ propertyType, sourceType, index });
  const CustomInput = useManagePropertyCustomInput(propertyType, selectedField);
  const [showFallback, setShowFallback] = useState(
    () => !!String(rule?.fallbackValue ?? '').trim(),
  );

  const handleRemoveFallback = () => {
    setValue(`rules.${index}.fallbackValue`, undefined, { shouldDirty: true });
    setShowFallback(false);
  };

  return (
    <div className="border rounded p-4  mb-2 relative group">
      <div className="flex flex-row gap-4 mb-4  items-end">
        <Form.Field
          control={control}
          name={`rules.${index}.field`}
          render={({ field }) => (
            <Form.Item className="w-3/5">
              <Form.Label>{t('field', 'Field')} </Form.Label>

              <Select value={field.value} onValueChange={handleFieldChange}>
                <Select.Trigger>
                  <Select.Value placeholder={t('select-a-field', 'Select a field')} />
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
            <Form.Item className="w-2/5 ">
              <Form.Label>{t('operator', 'Operator')}</Form.Label>

              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder={t('select-an-operator', 'Select an operator')} />
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

        <Button
          variant="destructive"
          size="icon"
          className="flex-shrink-0 opacity-0  absolute -top-6 right-1 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out"
          onClick={handleRemove}
        >
          <IconTrash size={16} />
        </Button>
      </div>
      <div className="mb-4">
        <Form.Field
          control={control}
          name={`rules.${index}.value`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('value', 'Value')}</Form.Label>

              {CustomInput ? (
                <ManagePropertyCustomInput
                  CustomInput={CustomInput}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  meta={rule?.meta}
                  onMetaChange={(meta) =>
                    setValue(`rules.${index}.meta`, meta, {
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
              )}

              <Form.Message />
            </Form.Item>
          )}
        />

        {!CustomInput &&
          (showFallback ? (
            <Form.Field
              control={control}
              name={`rules.${index}.fallbackValue`}
              render={({ field }) => (
                <Form.Item className="mt-2">
                  <div className="flex items-center justify-between">
                    <Form.Label className="text-muted-foreground">
                      Else — used when the value above is empty
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
              <IconCornerDownRight size={14} />
              Else (fallback when empty)
            </Button>
          ))}
      </div>
    </div>
  );
};
