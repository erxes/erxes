import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationActionFormProps,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  createFormLinkActionFormSchema,
  TCreateFormLinkActionForm,
} from '../../states/createFormLinkActionForm';
import { SelectTriggerForm } from '../trigger/SelectTriggerForm';

export const CreateFormLinkActionForm = ({
  formRef,
  currentAction,
  onSaveActionConfig,
}: AutomationActionFormProps<TCreateFormLinkActionForm>) => {
  const { t } = useTranslation('frontline');
  const form = useForm<TCreateFormLinkActionForm>({
    resolver: zodResolver(createFormLinkActionFormSchema),
    defaultValues: {
      formId: currentAction?.config?.formId || '',
      expiresInDays:
        currentAction?.config?.expiresInDays !== undefined
          ? String(currentAction.config.expiresInDays)
          : '',
    },
  });
  const { control, handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: t('create-form-link-form-name', 'Create form link'),
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveActionConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4">
        <Form.Field
          control={control}
          name="formId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('form', 'Form')}</Form.Label>
              <SelectTriggerForm
                value={field.value}
                onValueChange={field.onChange}
              />
              <Form.Description>
                {t(
                  'create-form-link-form-description',
                  'The answer is saved for this record and its customer. Use the link in a later message or email step.',
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="expiresInDays"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('link-expires-in-days', 'Link valid for (days)')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  placeholder="30"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              </Form.Control>
              <Form.Description>
                {t(
                  'link-expires-description',
                  'Each link takes one answer. 30 days when empty.',
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
