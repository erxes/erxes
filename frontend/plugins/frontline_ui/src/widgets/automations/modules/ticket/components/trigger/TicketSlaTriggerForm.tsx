import { Checkbox, Form, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { AutomationTriggerFormProps } from 'ui-modules';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { useTicketSlaTriggerForm } from '../../hooks/useTicketSlaTriggerForm';
import {
  TICKET_SLA_EVENTS,
  type TTicketSlaTriggerForm,
} from '../../states/ticketSlaTriggerForm';

const EVENT_LABELS: Record<(typeof TICKET_SLA_EVENTS)[number], string> = {
  'firstResponse.warning': 'First response about to be missed',
  'firstResponse.breached': 'First response missed',
  'resolution.warning': 'Resolution about to be missed',
  'resolution.breached': 'Resolution missed',
};

export const TicketSlaTriggerForm = (
  props: AutomationTriggerFormProps<TTicketSlaTriggerForm>,
) => {
  const { t } = useTranslation('frontline');
  const { form, channelId, events, changeChannel, changePipeline, toggleEvent } =
    useTicketSlaTriggerForm(props);

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
              <Form.Description>
                {t(
                  'ticket-sla-trigger-pipeline-description',
                  'Leave empty to listen to every pipeline with an SLA policy.',
                )}
              </Form.Description>
            </Form.Item>
          )}
        />
        <div className="space-y-2">
          <Label>{t('ticket-sla-trigger-events', 'Run when')}</Label>
          {TICKET_SLA_EVENTS.map((event) => (
            <label key={event} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={events.includes(event)}
                onCheckedChange={(checked) => toggleEvent(event, !!checked)}
              />
              {t(`ticket-sla-event-${event}`, EVENT_LABELS[event])}
            </label>
          ))}
          <p className="text-xs text-muted-foreground">
            {t(
              'ticket-sla-trigger-events-description',
              'Leave all unchecked to run on every warning and miss.',
            )}
          </p>
        </div>
      </div>
    </Form>
  );
};
