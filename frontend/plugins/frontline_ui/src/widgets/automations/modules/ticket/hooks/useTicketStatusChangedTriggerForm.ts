import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationTriggerFormProps,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  readTicketStatusChangedTriggerConfig,
  ticketStatusChangedTriggerFormSchema,
  TTicketStatusChangedTriggerForm,
} from '../states/ticketStatusChangedTriggerForm';

export const useTicketStatusChangedTriggerForm = ({
  formRef,
  activeTrigger,
  onSaveTriggerConfig,
}: Pick<
  AutomationTriggerFormProps<TTicketStatusChangedTriggerForm>,
  'formRef' | 'activeTrigger' | 'onSaveTriggerConfig'
>) => {
  const { t } = useTranslation('frontline');
  const form = useForm<TTicketStatusChangedTriggerForm>({
    resolver: zodResolver(ticketStatusChangedTriggerFormSchema),
    defaultValues: readTicketStatusChangedTriggerConfig(activeTrigger?.config),
  });
  const { handleSubmit, setValue, watch, reset } = form;

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: t('ticket-status-changed-trigger', 'Ticket status changed'),
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => handleSubmit(onSaveTriggerConfig, handleValidationErrors)(),
  });

  useEffect(() => {
    reset(readTicketStatusChangedTriggerConfig(activeTrigger?.config));
  }, [reset, activeTrigger?.config]);

  // Statuses belong to one pipeline, so a new channel or pipeline drops them
  const changeChannel = (channelId: string) => {
    setValue('channelId', channelId, { shouldDirty: true });
    setValue('pipelineId', '', { shouldDirty: true });
    setValue('toStatusIds', [], { shouldDirty: true });
  };

  const changePipeline = (pipelineId: string) => {
    setValue('pipelineId', pipelineId, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('toStatusIds', [], { shouldDirty: true });
  };

  return {
    form,
    channelId: watch('channelId'),
    pipelineId: watch('pipelineId'),
    changeChannel,
    changePipeline,
  };
};
