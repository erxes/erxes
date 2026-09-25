import {
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
import { SelectHelpCenterCms } from '@/helpcenter/components/SelectHelpCenterCms';
import { SelectHelpCenterForms } from '@/helpcenter/components/SelectHelpCenterForms';
import { SelectHelpCenterTopic } from '@/helpcenter/components/SelectHelpCenterTopic';
import { SelectHelpCenterClientPortal } from '@/helpcenter/components/SelectHelpCenterClientPortal';
import { FULL_WIDTH_SELECT } from '@/helpcenter/constants';
import { useHelpCenterCmsOptions } from '@/helpcenter/hooks/useHelpCenterCmsOptions';
import { IHelpCenterConfigInput } from '@/helpcenter/types';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectTriggerTicket } from '@/ticket/components/ticket-selects/SelectTicket';

function FeatureSection({
  control,
  toggleName,
  title,
  description,
  enabled,
  children,
}: Readonly<{
  control: Control<IHelpCenterConfigInput>;
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
      <div
        className={
          enabled ? 'grid gap-4 pt-3 border-t lg:grid-cols-2' : 'hidden'
        }
      >
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

export function HelpCenterGeneralTab({
  form,
  t,
}: Readonly<{
  form: UseFormReturn<IHelpCenterConfigInput>;
  t: TFunction;
}>) {
  const control = form.control;

  const showKnowledgeBase = useWatch({ control, name: 'kbToggle' });
  const showTickets = useWatch({ control, name: 'ticketToggle' });
  const ticketChannelId = useWatch({ control, name: 'ticketChannelId' });
  const ticketPipelineId = useWatch({ control, name: 'ticketPipelineId' });
  const formChannelId = useWatch({ control, name: 'formChannelId' });
  const url = useWatch({ control, name: 'url' });

  const {
    cmsList,
    loading: cmsLoading,
    error: cmsError,
    unavailable: cmsUnavailable,
  } = useHelpCenterCmsOptions();

  return (
    <div className="flex flex-col gap-4">
      <InfoCard title={t('general-settings', 'General')}>
        <InfoCard.Content className="gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Form.Field
              control={control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('name', 'Name')}{' '}
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
              name="clientPortalId"
              render={({ field }) => (
                <Form.Item className={FULL_WIDTH_SELECT}>
                  <Form.Label>
                    {t('sidebar.client-portal', 'Client portal')}
                  </Form.Label>
                  <Form.Control>
                    <SelectHelpCenterClientPortal
                      variant="form"
                      value={field.value}
                      domain={url}
                      onValueChange={(portal) => {
                        field.onChange(portal._id);
                        form.setValue('url', portal.domain);
                        form.setValue('erxesAppToken', portal.erxesAppToken);
                      }}
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

      <InfoCard
        title={t('forms', 'Forms')}
        className={showTickets ? undefined : 'hidden'}
      >
        <InfoCard.Content>
          <div className="grid gap-4 lg:grid-cols-2">
            <Form.Field
              control={control}
              name="formChannelId"
              render={({ field }) => (
                <Form.Item className={FULL_WIDTH_SELECT}>
                  <Form.Label>{t('channel-label')}</Form.Label>
                  <Form.Control>
                    <SelectChannel.FormItem
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('formIds', []);
                      }}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="formIds"
              render={({ field }) => (
                <Form.Item className={FULL_WIDTH_SELECT}>
                  <Form.Label>{t('forms', 'Forms')}</Form.Label>
                  <SelectHelpCenterForms
                    value={field.value}
                    channelId={formChannelId}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </InfoCard.Content>
      </InfoCard>

      {!cmsUnavailable && (
        <InfoCard title={t('cms', 'CMS')}>
          <InfoCard.Content>
            <div className="grid gap-4 lg:grid-cols-2">
              <Form.Field
                control={control}
                name="cmsConfigs"
                render={({ field }) => (
                  <Form.Item className={FULL_WIDTH_SELECT}>
                    <Form.Label>{t('cms', 'CMS')}</Form.Label>
                    <SelectHelpCenterCms
                      value={field.value}
                      cmsList={cmsList}
                      loading={cmsLoading}
                      error={cmsError}
                      onValueChange={field.onChange}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </InfoCard.Content>
        </InfoCard>
      )}
    </div>
  );
}
