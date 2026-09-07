import { IconCode } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Form,
  InfoCard,
  Input,
  PopoverScoped,
  Switch,
  Textarea,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { useState } from 'react';
import { Control, UseFormReturn, useWatch } from 'react-hook-form';
import { SelectHelpCenterTopic } from '@/helpcenter/components/SelectHelpCenterTopic';
import { getHelpCenterUrlError } from '@/helpcenter/utils/helpCenterUrl';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectTriggerTicket } from '@/ticket/components/ticket-selects/SelectTicket';
import { FULL_WIDTH_SELECT } from '@/knowledgebase/topicDrawerConstants';
import { Topic, TopicFormData } from '@/knowledgebase/topicDrawerTypes';

function FeatureSection({
  control,
  toggleName,
  title,
  description,
  enabled,
  children,
}: Readonly<{
  control: Control<TopicFormData>;
  toggleName: 'kbToggle' | 'ticketToggle';
  title: string;
  description: string;
  enabled: boolean;
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={control}
        name={toggleName}
        render={({ field }) => (
          <Form.Item className="flex flex-row gap-3 justify-between items-center space-y-0">
            <div className="space-y-1">
              <Form.Label>{title}</Form.Label>
              <Form.Description>{description}</Form.Description>
            </div>
            <Form.Control>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Form.Control>
          </Form.Item>
        )}
      />
      <div className={enabled ? 'flex flex-col gap-3' : 'hidden'}>
        {children}
      </div>
    </div>
  );
}

function TicketStatusField({
  value,
  pipelineId,
  onValueChange,
}: Readonly<{
  value: string;
  pipelineId: string;
  onValueChange: (value: string) => void;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <SelectStatusTicket.Provider
      value={value}
      pipelineId={pipelineId || undefined}
      onValueChange={(status) => {
        onValueChange(status);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="form" disabled={!pipelineId}>
          <SelectStatusTicket.Value />
        </SelectTriggerTicket>
        <Combobox.Content>
          <SelectStatusTicket.Content />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusTicket.Provider>
  );
}

export function TopicGeneralTab({
  form,
  topic,
  isEditing,
  onViewScript,
  t,
}: Readonly<{
  form: UseFormReturn<TopicFormData>;
  topic?: Topic;
  isEditing: boolean;
  onViewScript: () => void;
  t: TFunction;
}>) {
  const control = form.control;

  const showKnowledgeBase = useWatch({ control, name: 'kbToggle' });
  const showTickets = useWatch({ control, name: 'ticketToggle' });
  const ticketChannelId = useWatch({ control, name: 'ticketChannelId' });
  const ticketPipelineId = useWatch({ control, name: 'ticketPipelineId' });

  return (
    <div className="grid gap-4">
      <InfoCard title={t('general-settings', 'General')}>
        <InfoCard.Content>
          <div className="grid grid-cols-2 gap-4">
            <Form.Field
              control={control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('kb-title-required')}{' '}
                    <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder={t('kb-enter-topic-title')} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="url"
              rules={{
                validate: (value) => {
                  const error = getHelpCenterUrlError(value);

                  return error
                    ? t(
                        error,
                        'Enter a full website address starting with https://',
                      )
                    : true;
                },
              }}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('website', 'Website')}</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder={t(
                        'kb-enter-website',
                        'https://help.example.com',
                      )}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <Form.Field
            control={control}
            name="description"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('description')}</Form.Label>
                <Form.Control>
                  <Textarea
                    {...field}
                    placeholder={t('kb-enter-topic-description')}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </InfoCard.Content>
      </InfoCard>

      {isEditing && topic && (
        <InfoCard title={t('kb-embed-script')}>
          <InfoCard.Content>
            <div className="flex gap-3 justify-between items-start">
              <p className="text-sm text-muted-foreground">
                {t('kb-embed-description')}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={onViewScript}
              >
                <IconCode className="mr-2 w-4 h-4" />
                {t('kb-view-script')}
              </Button>
            </div>
          </InfoCard.Content>
        </InfoCard>
      )}

      <div className="grid gap-4 items-start lg:grid-cols-2">
        <InfoCard title={t('knowledgebase', 'Knowledge base')}>
          <InfoCard.Content>
            <FeatureSection
              control={control}
              toggleName="kbToggle"
              title={t('show-knowledgebase', 'Show knowledge base')}
              description={t(
                'kb-show-knowledgebase-description',
                'Show the articles on the published site.',
              )}
              enabled={showKnowledgeBase}
            >
              <Form.Field
                control={control}
                name="kbLabel"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('knowledgebase-name', 'Knowledge base name')}
                    </Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder={t(
                          'kb-enter-menu-label',
                          'Shown name on menu',
                        )}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name="kbTopicId"
                rules={{
                  validate: (value) =>
                    !showKnowledgeBase || !!value || 'Topic is required',
                }}
                render={({ field }) => (
                  <Form.Item className={FULL_WIDTH_SELECT}>
                    <Form.Label>
                      {t('knowledgebase-topic', 'Knowledge base topic')}{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <SelectHelpCenterTopic
                        variant="form"
                        value={field.value}
                        excludeId={topic?._id}
                        onValueChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </FeatureSection>
          </InfoCard.Content>
        </InfoCard>

        <InfoCard title={t('tickets')}>
          <InfoCard.Content>
            <FeatureSection
              control={control}
              toggleName="ticketToggle"
              title={t('show-tickets', 'Show tickets')}
              description={t(
                'kb-show-tickets-description',
                'Let visitors raise a ticket from the published site.',
              )}
              enabled={showTickets}
            >
              <Form.Field
                control={control}
                name="ticketLabel"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('ticket-name', 'Ticket name')}</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder={t(
                          'kb-enter-menu-label',
                          'Shown name on menu',
                        )}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name="ticketChannelId"
                rules={{
                  validate: (value) =>
                    !showTickets || !!value || 'Channel is required',
                }}
                render={({ field }) => (
                  <Form.Item className={FULL_WIDTH_SELECT}>
                    <Form.Label>
                      {t('channel-label')}{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <SelectChannel.FormItem
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('ticketPipelineId', '');
                          form.setValue('ticketStatusId', '');
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name="ticketPipelineId"
                rules={{
                  validate: (value) =>
                    !showTickets || !!value || 'Pipeline is required',
                }}
                render={({ field }) => (
                  <Form.Item className={FULL_WIDTH_SELECT}>
                    <Form.Label>
                      {t('pipeline-label')}{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <SelectPipeline
                        variant="form"
                        value={field.value}
                        channelId={ticketChannelId || undefined}
                        disabled={!ticketChannelId}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('ticketStatusId', '');
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name="ticketStatusId"
                render={({ field }) => (
                  <Form.Item className={FULL_WIDTH_SELECT}>
                    <Form.Label>{t('status-label')}</Form.Label>
                    <Form.Control>
                      <TicketStatusField
                        value={field.value}
                        pipelineId={ticketPipelineId}
                        onValueChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </FeatureSection>
          </InfoCard.Content>
        </InfoCard>
      </div>
    </div>
  );
}
