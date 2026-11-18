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
  readTicketSlaTriggerConfig,
  ticketSlaTriggerFormSchema,
  TTicketSlaEvent,
  TTicketSlaTriggerForm,
} from '../states/ticketSlaTriggerForm';

export const useTicketSlaTriggerForm = ({
  formRef,
  activeTrigger,
  onSaveTriggerConfig,
}: Pick<
  AutomationTriggerFormProps<TTicketSlaTriggerForm>,
  'formRef' | 'activeTrigger' | 'onSaveTriggerConfig'
>) => {
  const { t } = useTranslation('frontline');
  const form = useForm<TTicketSlaTriggerForm>({
    resolver: zodResolver(ticketSlaTriggerFormSchema),
    defaultValues: readTicketSlaTriggerConfig(activeTrigger?.config),
  });
  const { handleSubmit, setValue, watch, reset, getValues } = form;

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: t('ticket-sla-trigger', 'Ticket SLA'),
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => handleSubmit(onSaveTriggerConfig, handleValidationErrors)(),
  });

  useEffect(() => {
    reset(readTicketSlaTriggerConfig(activeTrigger?.config));
  }, [reset, activeTrigger?.config]);

  const changeChannel = (channelId: string) => {
    setValue('channelId', channelId, { shouldDirty: true });
    setValue('pipelineId', undefined, { shouldDirty: true });
  };

  const changePipeline = (pipelineId: string) =>
    setValue('pipelineId', pipelineId || undefined, { shouldDirty: true });

  const toggleEvent = (event: TTicketSlaEvent, checked: boolean) => {
    const events = getValues('events');

    setValue(
      'events',
      checked
        ? [...new Set([...events, event])]
        : events.filter((item) => item !== event),
      { shouldDirty: true },
    );
  };

  return {
    form,
    channelId: watch('channelId'),
    events: watch('events'),
    changeChannel,
    changePipeline,
    toggleEvent,
  };
};
