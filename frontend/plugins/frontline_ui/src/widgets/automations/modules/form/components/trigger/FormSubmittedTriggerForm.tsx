import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Select, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { AutomationTriggerFormProps } from 'ui-modules';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import { useFormSubmittedTriggerForm } from '../../hooks/useFormSubmittedTriggerForm';
import type { TFormSubmittedTriggerForm } from '../../states/formSubmittedTriggerForm';
import { FormFieldConditionRow } from './FormFieldConditionRow';
import { SelectTriggerForm } from './SelectTriggerForm';

export const FormSubmittedTriggerForm = (
  props: AutomationTriggerFormProps<TFormSubmittedTriggerForm>,
) => {
  const { t } = useTranslation('frontline');
  const {
    form,
    channelId,
    formId,
    fields,
    fieldsLoading,
    conditionRows,
    addCondition,
    removeCondition,
    changeChannel,
    changeForm,
  } = useFormSubmittedTriggerForm(props);

  const { control } = form;

  return (
    <Form {...form}>
      <div className="p-4 space-y-4">
        <Form.Field
          control={control}
          name="channelId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('channel', 'Channel')}</Form.Label>
              <SelectChannel.FormItem
                value={field.value || ''}
                onValueChange={(value) =>
                  changeChannel(
                    typeof value === 'string' && value !== field.value
                      ? value
                      : undefined,
                  )
                }
              />
              <Form.Description>
                {t(
                  'form-trigger-channel-description',
                  'Narrows the form list to one channel.',
                )}
              </Form.Description>
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="formId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('form', 'Form')}</Form.Label>
              <SelectTriggerForm
                channelId={channelId}
                value={field.value}
                onValueChange={changeForm}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        {formId && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Form.Label>
                {t('form-trigger-conditions', 'Field conditions (optional)')}
              </Form.Label>
              {conditionRows.length > 1 && (
                <Form.Field
                  control={control}
                  name="conjunction"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger className="w-36">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="and">
                          {t('form-trigger-match-all', 'Match all')}
                        </Select.Item>
                        <Select.Item value="or">
                          {t('form-trigger-match-any', 'Match any')}
                        </Select.Item>
                      </Select.Content>
                    </Select>
                  )}
                />
              )}
            </div>

            {fieldsLoading ? (
              <Spinner />
            ) : (
              conditionRows.map((row, index) => (
                <FormFieldConditionRow
                  key={row.id}
                  control={control}
                  index={index}
                  fields={fields}
                  onRemove={() => removeCondition(index)}
                />
              ))
            )}

            {!conditionRows.length && (
              <p className="text-sm text-muted-foreground">
                {t(
                  'form-trigger-no-conditions',
                  'Every submission of this form starts the workflow.',
                )}
              </p>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={addCondition}
              disabled={fieldsLoading || !fields.length}
            >
              <IconPlus />
              {t('form-trigger-add-condition', 'Add condition')}
            </Button>
          </div>
        )}
      </div>
    </Form>
  );
};
