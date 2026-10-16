import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import {
  SelectTicketContent,
  SelectTriggerTicket,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { Form, PopoverScoped } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldValues, UseFormReturn, useWatch } from 'react-hook-form';

const FULL_WIDTH_SELECT_ITEM_CLASS =
  'min-w-0 [&_[role=combobox]]:w-full [&_[role=combobox]]:max-w-none';

const TicketStatusConfigSelect = ({
  value,
  onValueChange,
  pipelineId,
}: {
  value: string;
  onValueChange: (value: string) => void;
  pipelineId?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectStatusTicket.Provider
      value={value}
      pipelineId={pipelineId}
      onValueChange={(statusId) => {
        onValueChange(statusId);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="form">
          <SelectStatusTicket.Value />
        </SelectTriggerTicket>
        <SelectTicketContent variant="form">
          <SelectStatusTicket.Content />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectStatusTicket.Provider>
  );
};

// Each pick narrows the next, so a change clears what depended on it
const useTicketPlacementFields = (form: UseFormReturn<FieldValues>) => {
  const [channelId, pipelineId] = useWatch({
    control: form.control,
    name: ['channelId', 'pipelineId'],
  });

  return {
    channelId,
    pipelineId,
    changeChannel: (value: string) => {
      form.setValue('channelId', value, { shouldDirty: true });
      form.setValue('pipelineId', '', { shouldDirty: true });
      form.setValue('statusId', '', { shouldDirty: true });
    },
    changePipeline: (value: string) => {
      form.setValue('pipelineId', value, { shouldDirty: true });
      form.setValue('statusId', '', { shouldDirty: true });
    },
  };
};

/**
 * Where the ticket lands: channel, pipeline and status picked together. The
 * same block serves the plain value and every conditional rule, so a rule
 * can never pair a status with another pipeline.
 */
export const TicketPlacementFields = ({
  form,
}: {
  form: UseFormReturn<FieldValues>;
}) => {
  const { t } = useTranslation('frontline');
  const { channelId, pipelineId, changeChannel, changePipeline } =
    useTicketPlacementFields(form);

  return (
    <div className="grid grid-cols-3 gap-2">
      <Form.Field
        control={form.control}
        name="channelId"
        render={({ field }) => (
          <Form.Item className={FULL_WIDTH_SELECT_ITEM_CLASS}>
            <Form.Label>{t('channel-label', 'Channel')}</Form.Label>
            <SelectChannel.FormItem
              value={field.value || ''}
              onValueChange={changeChannel}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="pipelineId"
        render={({ field }) => (
          <Form.Item className={FULL_WIDTH_SELECT_ITEM_CLASS}>
            <Form.Label>{t('pipeline-label', 'Pipeline')}</Form.Label>
            <SelectPipeline
              variant="form"
              value={field.value || ''}
              channelId={channelId}
              onValueChange={changePipeline}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="statusId"
        render={({ field }) => (
          <Form.Item className={FULL_WIDTH_SELECT_ITEM_CLASS}>
            <Form.Label>{t('status', 'Status')}</Form.Label>
            <TicketStatusConfigSelect
              value={field.value || ''}
              pipelineId={pipelineId}
              onValueChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
