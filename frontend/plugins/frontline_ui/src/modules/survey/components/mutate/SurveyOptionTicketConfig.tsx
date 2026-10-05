import { IconTicket } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Form,
  Input,
  Label,
  Popover,
  Select,
  Switch,
} from 'erxes-ui';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { useGetAccessibleTicketStatuses } from '@/status/hooks/useGetTicketStatus';
import { TSurveyContent } from '@/survey/constants/surveySetupSchema';

const TicketStatusSelect = ({
  pipelineId,
  value,
  onValueChange,
}: {
  pipelineId: string | null;
  value: string | null;
  onValueChange: (value: string | null) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { statuses, loading } = useGetAccessibleTicketStatuses({
    variables: { pipelineId },
    skip: !pipelineId,
  });

  return (
    <Select
      value={value || ''}
      onValueChange={(next) => onValueChange(next || null)}
      disabled={!pipelineId || loading}
    >
      <Select.Trigger>
        <Select.Value
          placeholder={
            pipelineId
              ? t('select-status', 'Select a status')
              : t('select-pipeline-first', 'Choose a pipeline first')
          }
        />
      </Select.Trigger>
      <Select.Content>
        {statuses.map((status) => (
          <Select.Item key={status.value} value={status.value}>
            {status.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

export const SurveyOptionTicketConfig = ({
  form,
  stepIndex,
  optionIndex,
}: {
  form: UseFormReturn<TSurveyContent>;
  stepIndex: number;
  optionIndex: number;
}) => {
  const { t } = useTranslation('frontline');
  const { id: channelId } = useParams<{ id: string }>();
  const path = `steps.${stepIndex}.options.${optionIndex}` as const;

  const option = useWatch({ control: form.control, name: path });
  const enabled = Boolean(option?.ticketCreationEnabled);
  const created = Boolean(option?.ticketCreated);

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant={enabled ? 'secondary' : 'ghost'}
          size="sm"
          className="shrink-0 gap-1 text-muted-foreground"
          title={t('survey-option-ticket', 'Ticket automation')}
        >
          <IconTicket />
          {enabled && (
            <Badge variant={created ? 'success' : 'secondary'}>
              {option?.ticketCreationThreshold ?? '—'}
            </Badge>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-80 p-4">
        <div className="flex flex-col gap-4">
          <Form.Field
            control={form.control}
            name={`${path}.ticketCreationEnabled`}
            render={({ field }) => (
              <Form.Item className="flex items-center justify-between gap-2">
                <Form.Label>
                  {t('create-ticket-on-threshold', 'Create a ticket')}
                </Form.Label>
                <Form.Control>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />

          {enabled && (
            <>
              <Form.Field
                control={form.control}
                name={`${path}.ticketCreationThreshold`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('vote-threshold', 'Vote threshold')}
                    </Form.Label>
                    <Form.Control>
                      <Input
                        type="number"
                        min={1}
                        value={field.value ?? ''}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value
                              ? Number(event.target.value)
                              : null,
                          )
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name={`${path}.ticketPipelineId`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('pipelines')}</Form.Label>
                    <SelectPipeline
                      channelId={channelId}
                      value={field.value || ''}
                      onValueChange={(value) => {
                        field.onChange(value || null);
                        form.setValue(`${path}.ticketStatusId`, null);
                      }}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name={`${path}.ticketStatusId`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('status')}</Form.Label>
                    <TicketStatusSelect
                      pipelineId={option?.ticketPipelineId ?? null}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {created && (
                <Label className="text-xs font-normal text-muted-foreground">
                  {t(
                    'survey-ticket-already-created',
                    'A ticket was already created for this option. It will not be created again.',
                  )}
                </Label>
              )}
            </>
          )}
        </div>
      </Popover.Content>
    </Popover>
  );
};
