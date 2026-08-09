import { zodResolver } from '@hookform/resolvers/zod';
import { IconMessagePlus, IconRefresh, IconSend } from '@tabler/icons-react';
import { Button, Dialog, Form, Input, Select, Spinner, toast } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SelectCustomer } from 'ui-modules';
import { z } from 'zod';
import { useStartWhatsappConversation } from '../hooks/useStartWhatsappConversation';
import { useWhatsappIntegrationTemplates } from '../hooks/useWhatsappIntegrationTemplates';
import { useWhatsappSenderIntegrations } from '../hooks/useWhatsappSenderIntegrations';
import { IWhatsappTemplate } from '../types/WhatsappTemplate';
import {
  buildTemplateDispatch,
  buildTemplatePreview,
  getBodyPlaceholders,
  getDynamicButtons,
  getHeaderPlaceholders,
} from '../utils/whatsappTemplateUtils';

/**
 * Values mirror the in-thread template picker, plus the two things a thread
 * would otherwise have supplied: who to message and which number to send from.
 */
const NEW_CONVERSATION_SCHEMA = z.object({
  integrationId: z.string(),
  customerId: z.string(),
  templateId: z.string(),
  headerValues: z.array(z.string()),
  bodyValues: z.array(z.string()),
  buttonValues: z.array(z.string()),
});

type WhatsappNewConversationValues = z.infer<typeof NEW_CONVERSATION_SCHEMA>;

/** Messages are injected so the resolver can be built with translated copy. */
const buildSchema = (
  template: IWhatsappTemplate | undefined,
  messages: {
    integration: string;
    customer: string;
    template: string;
    required: string;
    header: string;
    body: string;
    button: string;
  },
) => {
  const headerCount = getHeaderPlaceholders(template).length;
  const bodyCount = getBodyPlaceholders(template).length;
  const buttonCount = getDynamicButtons(template).length;

  const required = z.string().trim().min(1, messages.required);

  return NEW_CONVERSATION_SCHEMA.extend({
    integrationId: z.string().min(1, messages.integration),
    customerId: z.string().min(1, messages.customer),
    templateId: z.string().min(1, messages.template),
    headerValues: z.array(required).length(headerCount, messages.header),
    bodyValues: z.array(required).length(bodyCount, messages.body),
    buttonValues: z.array(required).length(buttonCount, messages.button),
  });
};

const buildEmptyValues = (
  customerId?: string,
): WhatsappNewConversationValues => ({
  integrationId: '',
  customerId: customerId || '',
  templateId: '',
  headerValues: [],
  bodyValues: [],
  buttonValues: [],
});

/**
 * Starts a WhatsApp conversation with someone who has never messaged in.
 *
 * WhatsApp forbids free-form outbound outside the 24 hour customer service
 * window, and a contact who has never written is by definition outside it — a
 * plain text composer here would only ever produce error 131047. So this is
 * deliberately NOT a free-form composer: pick a contact, pick an approved
 * template, fill its variables, send. That is the only outbound Meta accepts.
 *
 * The template machinery is shared verbatim with the in-thread picker, so a
 * template renders and validates identically whether it opens a thread or
 * continues one.
 *
 * Reused as the contact detail page's "Message on WhatsApp" action —
 * `customerId` pre-fills and hides the contact picker rather than the two
 * surfaces building separate mutation logic, and `trigger` lets the caller
 * supply a different opener (the header uses an icon button, a contact page
 * a labelled one) around the identical dialog.
 */
export const WhatsappNewConversation = ({
  customerId: fixedCustomerId,
  trigger,
}: {
  customerId?: string;
  trigger?: React.ReactNode;
} = {}) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { integrations, loading: integrationsLoading } =
    useWhatsappSenderIntegrations(!open);
  const { startWhatsappConversation, loading: sending } =
    useStartWhatsappConversation();

  const form = useForm<WhatsappNewConversationValues>({
    defaultValues: buildEmptyValues(fixedCustomerId),
    resolver: (values, context, options) => {
      const selected = templates.find((item) => item.id === values.templateId);

      return zodResolver(
        buildSchema(selected, {
          integration: t('whatsapp-new-conversation-number-required'),
          customer: t('whatsapp-new-conversation-contact-required'),
          template: t('whatsapp-template-required'),
          required: t('whatsapp-template-variable-required'),
          header: t('whatsapp-template-header-incomplete'),
          body: t('whatsapp-template-body-incomplete'),
          button: t('whatsapp-template-button-incomplete'),
        }),
      )(values, context, options);
    },
  });

  const integrationId = form.watch('integrationId');
  const templateId = form.watch('templateId');
  const headerValues = form.watch('headerValues');
  const bodyValues = form.watch('bodyValues');
  const buttonValues = form.watch('buttonValues');

  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
  } = useWhatsappIntegrationTemplates(integrationId || undefined);

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === templateId),
    [templates, templateId],
  );

  const headerPlaceholders = getHeaderPlaceholders(selectedTemplate);
  const bodyPlaceholders = getBodyPlaceholders(selectedTemplate);
  const dynamicButtons = getDynamicButtons(selectedTemplate);

  // The contact-page trigger mounts this dialog once and reopens it across
  // several visits rather than remounting per-open, so react-hook-form's
  // mount-time defaultValues alone would only pin the first customer ever
  // opened against. Reapplied on every open instead.
  useEffect(() => {
    if (open && fixedCustomerId) {
      form.setValue('customerId', fixedCustomerId);
    }
  }, [open, fixedCustomerId, form]);

  // With exactly one connected number there is nothing to choose, so it is
  // filled in rather than presented as a decision.
  useEffect(() => {
    if (integrations.length === 1 && !integrationId) {
      form.setValue('integrationId', integrations[0]._id);
    }
  }, [integrations, integrationId, form]);

  // Re-size the value arrays whenever the agent picks a different template, so
  // a previous template's answers cannot be submitted against the new one.
  useEffect(() => {
    form.setValue(
      'headerValues',
      Array.from({ length: headerPlaceholders.length }, () => ''),
    );
    form.setValue(
      'bodyValues',
      Array.from({ length: bodyPlaceholders.length }, () => ''),
    );
    form.setValue(
      'buttonValues',
      Array.from({ length: dynamicButtons.length }, () => ''),
    );
  }, [
    templateId,
    headerPlaceholders.length,
    bodyPlaceholders.length,
    dynamicButtons.length,
    form,
  ]);

  // A template belongs to the number it was approved on, so switching numbers
  // must not carry the previous number's template across.
  useEffect(() => {
    form.setValue('templateId', '');
  }, [integrationId, form]);

  const preview = selectedTemplate
    ? buildTemplatePreview(
        selectedTemplate,
        headerValues || [],
        bodyValues || [],
        buttonValues || [],
      )
    : '';

  const onSubmit = (values: WhatsappNewConversationValues) => {
    if (!selectedTemplate) {
      return;
    }

    const content = buildTemplatePreview(
      selectedTemplate,
      values.headerValues,
      values.bodyValues,
      values.buttonValues,
    );

    startWhatsappConversation({
      variables: {
        integrationId: values.integrationId,
        customerId: values.customerId,
        templateName: selectedTemplate.name,
        languageCode: selectedTemplate.language,
        components: buildTemplateDispatch(
          selectedTemplate,
          values.headerValues,
          values.bodyValues,
          values.buttonValues,
        ).components,
        // The resolved copy is stored as the message body so the new thread
        // shows what the customer actually received rather than an empty bubble.
        content,
      },
      onCompleted: (data) => {
        toast({ title: t('whatsapp-new-conversation-sent') });
        form.reset(buildEmptyValues(fixedCustomerId));
        setOpen(false);

        // Drop the agent straight into the thread they just opened; otherwise
        // they would have to hunt for it in the list.
        if (data?.whatsappStartConversation) {
          navigate(
            `/frontline/inbox?conversationId=${data.whatsappStartConversation}`,
          );
        }
      },
      onError: (err) =>
        toast({
          title: t('whatsapp-new-conversation-failed', {
            message: err.message,
          }),
          variant: 'destructive',
        }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('whatsapp-new-conversation')}
          >
            <IconMessagePlus className="text-accent-foreground" />
          </Button>
        )}
      </Dialog.Trigger>
      <Dialog.Content className="flex max-h-[90vh] flex-col overflow-hidden">
        <Dialog.Header>
          <Dialog.Title>{t('whatsapp-new-conversation')}</Dialog.Title>
          <Dialog.Description>
            {t('whatsapp-new-conversation-description')}
          </Dialog.Description>
        </Dialog.Header>

        {integrationsLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
            <Spinner size="sm" />
            {t('whatsapp-templates-loading')}
          </div>
        ) : !integrations.length ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium">
              {t('whatsapp-new-conversation-no-numbers')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('whatsapp-new-conversation-no-numbers-description')}
            </p>
          </div>
        ) : (
          <Form {...form}>
            {/* Only the fields scroll: a template with many variables used to
                push the send button below the fold, leaving the dialog's one
                action unreachable until the agent scrolled for it. */}
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                {integrations.length > 1 && (
                  <Form.Field
                    control={form.control}
                    name="integrationId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('whatsapp-new-conversation-number')}
                        </Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger>
                              <Select.Value
                                placeholder={t(
                                  'whatsapp-new-conversation-number-placeholder',
                                )}
                              />
                            </Select.Trigger>
                            <Select.Content>
                              {integrations.map((integration) => (
                                <Select.Item
                                  key={integration._id}
                                  value={integration._id}
                                >
                                  {integration.displayPhoneNumber
                                    ? `${integration.name} (${integration.displayPhoneNumber})`
                                    : integration.name}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}

                {/* The contact page opens this dialog already knowing who —
                    re-asking would let the agent pick someone other than the
                    record they were looking at. */}
                {!fixedCustomerId && (
                  <Form.Field
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('whatsapp-new-conversation-contact')}
                        </Form.Label>
                        <SelectCustomer.FormItem
                          mode="single"
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(
                              Array.isArray(value) ? value[0] : value,
                            )
                          }
                        />
                        <Form.Description>
                          {t('whatsapp-new-conversation-contact-description')}
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}

                {templatesLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner size="sm" />
                    {t('whatsapp-templates-loading')}
                  </div>
                )}

                {!!templatesError && (
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {t('whatsapp-templates-load-failed')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => refetchTemplates()}
                    >
                      <IconRefresh />
                      {t('whatsapp-templates-retry')}
                    </Button>
                  </div>
                )}

                {!!integrationId &&
                  !templatesLoading &&
                  !templatesError &&
                  !templates.length && (
                    <div className="py-4 text-center">
                      <p className="text-sm font-medium">
                        {t('whatsapp-templates-empty')}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t('whatsapp-templates-empty-description')}
                      </p>
                    </div>
                  )}

                {!!templates.length && (
                  <Form.Field
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('whatsapp-template')}</Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger>
                              <Select.Value
                                placeholder={t('whatsapp-template-placeholder')}
                              />
                            </Select.Trigger>
                            <Select.Content>
                              {templates.map((template) => (
                                <Select.Item
                                  key={template.id}
                                  value={template.id}
                                >
                                  {template.name} ({template.language})
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </Form.Control>
                        <Form.Description>
                          {t('whatsapp-new-conversation-template-description')}
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}

                {headerPlaceholders.map((placeholder, index) => (
                  <Form.Field
                    key={`header-${placeholder}`}
                    control={form.control}
                    name={`headerValues.${index}` as const}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('whatsapp-template-header-variable', {
                            index: placeholder,
                          })}
                        </Form.Label>
                        <Form.Control>
                          <Input {...field} autoComplete="off" />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                ))}

                {bodyPlaceholders.map((placeholder, index) => (
                  <Form.Field
                    key={`body-${placeholder}`}
                    control={form.control}
                    name={`bodyValues.${index}` as const}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('whatsapp-template-body-variable', {
                            index: placeholder,
                          })}
                        </Form.Label>
                        <Form.Control>
                          <Input {...field} autoComplete="off" />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                ))}

                {dynamicButtons.map(({ button }, index) => (
                  <Form.Field
                    key={`button-${index}`}
                    control={form.control}
                    name={`buttonValues.${index}` as const}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {button.text
                            ? t('whatsapp-template-button-variable-named', {
                                label: button.text,
                              })
                            : t('whatsapp-template-button-variable')}
                        </Form.Label>
                        <Form.Control>
                          <Input {...field} autoComplete="off" />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                ))}

                {!!preview && (
                  <div className="rounded-lg border bg-background p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      {t('whatsapp-template-preview')}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm">
                      {preview}
                    </p>
                  </div>
                )}
              </div>

              <Dialog.Footer className="pt-4">
                <Button type="submit" disabled={sending || !selectedTemplate}>
                  {sending ? <Spinner size="sm" /> : <IconSend />}
                  {t('whatsapp-new-conversation-send')}
                </Button>
              </Dialog.Footer>
            </form>
          </Form>
        )}
      </Dialog.Content>
    </Dialog>
  );
};
