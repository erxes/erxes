import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { AutomationTriggerFormProps } from 'ui-modules';
import { TicketStatusChecklist } from '@/status/components/TicketStatusChecklist';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { useTicketStatusChangedTriggerForm } from '../../hooks/useTicketStatusChangedTriggerForm';
import type { TTicketStatusChangedTriggerForm } from '../../states/ticketStatusChangedTriggerForm';

export const TicketStatusChangedTriggerForm = (
  props: AutomationTriggerFormProps<TTicketStatusChangedTriggerForm>,
) => {
  const { t } = useTranslation('frontline');
  const { form, channelId, pipelineId, changeChannel, changePipeline } =
    useTicketStatusChangedTriggerForm(props);

  return (
    <Form {...form}>
      <div className="p-4 space-y-4">
        <Form.Field
          control={form.control}
          name="channelId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('channel-label', 'Channel')}</Form.Label>
              <SelectChannel.FormItem
                value={field.value || ''}
                onValueChange={changeChannel}
              />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="pipelineId"
          render={({ field }) => (
            <Form.Item>
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
        {pipelineId && (
          <Form.Field
            control={form.control}
            name="toStatusIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('ticket-status-changed-to', 'Moved to (optional)')}
                </Form.Label>
                <TicketStatusChecklist
                  pipelineId={pipelineId}
                  value={field.value}
                  onChange={field.onChange}
                />
                <Form.Description>
                  {t(
                    'ticket-status-changed-to-description',
                    'Leave empty to run on a move to any status of this pipeline.',
                  )}
                </Form.Description>
              </Form.Item>
            )}
          />
        )}
      </div>
    </Form>
  );
};
