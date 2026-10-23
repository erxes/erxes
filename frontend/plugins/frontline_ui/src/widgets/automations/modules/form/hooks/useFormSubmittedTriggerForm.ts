import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationTriggerFormProps,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { useFormDetail } from '@/forms/hooks/useFormDetail';
import {
  formSubmittedTriggerFormSchema,
  readFormSubmittedTriggerConfig,
  TFormSubmittedTriggerForm,
} from '../states/formSubmittedTriggerForm';

export type TFormTriggerField = {
  _id: string;
  label: string;
  options: string[];
};

const toTriggerFields = (
  fields: ({
    _id: string;
    text: string | null;
    type: string | null;
    options: (string | null)[] | null;
  } | null)[],
): TFormTriggerField[] =>
  fields.flatMap((field) =>
    field?.type
      ? [
          {
            _id: field._id,
            label: field.text || field.type,
            options: (field.options || []).filter(
              (option): option is string => !!option,
            ),
          },
        ]
      : [],
  );

export const useFormSubmittedTriggerForm = ({
  formRef,
  activeTrigger,
  onSaveTriggerConfig,
}: Pick<
  AutomationTriggerFormProps<TFormSubmittedTriggerForm>,
  'formRef' | 'activeTrigger' | 'onSaveTriggerConfig'
>) => {
  const { t } = useTranslation('frontline');

  const form = useForm<TFormSubmittedTriggerForm>({
    resolver: zodResolver(formSubmittedTriggerFormSchema),
    defaultValues: readFormSubmittedTriggerConfig(activeTrigger?.config),
  });

  const { control, handleSubmit, setValue, watch, reset } = form;

  const conditions = useFieldArray({ control, name: 'conditions' });

  const channelId = watch('channelId');
  const formId = watch('formId');

  const { formDetail, loading: fieldsLoading } = useFormDetail({ formId });
  const fields = toTriggerFields(formDetail?.fields || []);

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: t('form-trigger-form-name', 'Form Submitted Trigger'),
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => handleSubmit(onSaveTriggerConfig, handleValidationErrors)(),
  });

  useEffect(() => {
    reset(readFormSubmittedTriggerConfig(activeTrigger?.config));
  }, [reset, activeTrigger?.config]);

  // Field ids belong to one form, so a new channel or form drops the rules
  const changeChannel = (nextChannelId?: string) => {
    setValue('channelId', nextChannelId, { shouldDirty: true });
    setValue('formId', '', { shouldDirty: true });
    setValue('conditions', [], { shouldDirty: true });
  };

  const changeForm = (nextFormId: string) => {
    setValue('formId', nextFormId, { shouldDirty: true, shouldValidate: true });
    setValue('conditions', [], { shouldDirty: true });
  };

  const addCondition = () =>
    conditions.append({ fieldId: '', operator: 'e', value: '' });

  return {
    form,
    channelId,
    formId,
    fields,
    fieldsLoading,
    conditionRows: conditions.fields,
    addCondition,
    removeCondition: conditions.remove,
    changeChannel,
    changeForm,
  };
};
