import { useTranslation } from 'react-i18next';
import { AiAgentFieldOptionsBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentFieldOptionsBuilder';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { Form, Input, Select, Textarea } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';

export type TAiAgentFieldsGroupName = 'objectFields' | 'captureFields';

type TAiAgentFieldSuffix = 'fieldName' | 'prompt' | 'validation' | 'dataType';

// The open row of a field list; its summary line lives in the row trigger.
export const AiAgentObjectFieldBuilder = ({
  index,
  name = 'objectFields',
}: {
  index: number;
  name?: TAiAgentFieldsGroupName;
}) => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();
  // captureFields items share the exact shape of objectFields items, so the
  // objectFields path type is reused while the runtime path stays correct.
  const fieldPath = <S extends TAiAgentFieldSuffix>(suffix: S) =>
    `${name}.${index}.${suffix}` as `objectFields.${number}.${S}`;
  const isOption =
    useWatch({ control, name: fieldPath('dataType') }) === 'option';

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <Form.Field
          control={control}
          name={fieldPath('fieldName')}
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>{t('ai-agent-field-key')}</Form.Label>
              <Input {...field} placeholder="productName" />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name={fieldPath('dataType')}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('ai-agent-data-type')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="string">String</Select.Item>
                  <Select.Item value="number">Number</Select.Item>
                  <Select.Item value="boolean">Boolean</Select.Item>
                  <Select.Item value="object">Object</Select.Item>
                  <Select.Item value="array">Array</Select.Item>
                  <Select.Item value="option">Option</Select.Item>
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <Form.Field
        control={control}
        name={fieldPath('prompt')}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('ai-agent-field-prompt')}</Form.Label>
            <Textarea
              placeholder={t('ai-agent-field-prompt-placeholder')}
              {...field}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      {isOption ? (
        <AiAgentFieldOptionsBuilder name={name} index={index} />
      ) : (
        <Form.Field
          control={control}
          name={fieldPath('validation')}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('ai-agent-validation')}</Form.Label>
              <Input
                placeholder={t('ai-agent-field-validation-placeholder')}
                {...field}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </>
  );
};
