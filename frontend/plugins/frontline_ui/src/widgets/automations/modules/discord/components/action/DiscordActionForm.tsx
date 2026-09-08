import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Select, Textarea } from 'erxes-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { z } from 'zod';
import {
  useDiscordBotChannels,
  useDiscordBots,
} from '@/integrations/discord/hooks/useDiscordSetup';

const buttonSchema = z.object({
  label: z.string().optional().default(''),
  url: z.string().optional().default(''),
});

const attachmentSchema = z.object({
  url: z.string().optional().default(''),
  filename: z.string().optional().default(''),
});

const embedSchema = z.object({
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  url: z.string().optional().default(''),
  color: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
});

const discordMessageActionSchema = z
  .object({
    target: z.enum(['conversation', 'channel', 'dm']).default('conversation'),
    botId: z.string().optional().default(''),
    channelId: z.string().optional().default(''),
    userId: z.string().optional().default(''),
    content: z.string().optional().default(''),
    embed: embedSchema.optional(),
    buttons: z.array(buttonSchema).optional().default([]),
    attachments: z.array(attachmentSchema).optional().default([]),
  })
  .superRefine((value, ctx) => {
    // At least one thing to send.
    const hasEmbed = Object.values(value.embed || {}).some((v) =>
      String(v || '').trim(),
    );
    const hasButton = (value.buttons || []).some(
      (b) => b.label?.trim() && b.url?.trim(),
    );
    const hasAttachment = (value.attachments || []).some((a) => a.url?.trim());

    if (!value.content?.trim() && !hasEmbed && !hasButton && !hasAttachment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: 'Add content, an embed, a button, or an attachment',
      });
    }

    // Target-specific requirements.
    if (value.target !== 'conversation' && !value.botId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['botId'],
        message: 'Select a Discord bot',
      });
    }
    if (value.target === 'channel' && !value.channelId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['channelId'],
        message: 'Select a channel',
      });
    }
    if (value.target === 'dm' && !value.userId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['userId'],
        message: 'Enter a Discord user ID',
      });
    }
  });

export type TDiscordMessageActionForm = z.infer<
  typeof discordMessageActionSchema
>;

// The persisted action config is a previously-saved (possibly partial or
// absent) snapshot of this same form shape.
const defaultsFromConfig = (
  config?: Partial<TDiscordMessageActionForm> | null,
): TDiscordMessageActionForm => ({
  target: config?.target || 'conversation',
  botId: config?.botId || '',
  channelId: config?.channelId || '',
  userId: config?.userId || '',
  content: config?.content || '',
  embed: {
    title: config?.embed?.title || '',
    description: config?.embed?.description || '',
    url: config?.embed?.url || '',
    color: config?.embed?.color || '',
    imageUrl: config?.embed?.imageUrl || '',
  },
  buttons: config?.buttons?.length ? config.buttons : [],
  attachments: config?.attachments?.length ? config.attachments : [],
});

/** Small bold section heading used within the action form. */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm font-semibold text-foreground pt-2">{children}</div>
);

/** Automation action config form for "Send Discord message". */
export const DiscordActionForm = ({
  formRef,
  currentAction,
  onSaveActionConfig,
  targetType,
}: AutomationActionFormProps<TDiscordMessageActionForm>) => {
  const { t } = useTranslation('frontline');
  const form = useForm<TDiscordMessageActionForm>({
    resolver: zodResolver(discordMessageActionSchema),
    defaultValues: defaultsFromConfig(currentAction?.config),
  });
  const { control, handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: t('discord-action.form-name', 'Send Discord Message'),
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => handleSubmit(onSaveActionConfig, handleValidationErrors)(),
  });

  useEffect(() => {
    if (currentAction?.config) {
      form.reset(defaultsFromConfig(currentAction.config));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAction?.config]);

  const target = useWatch({ control, name: 'target' });
  const botId = useWatch({ control, name: 'botId' });

  const { bots } = useDiscordBots();
  const { channels } = useDiscordBotChannels(botId || '', target !== 'channel');

  const buttons = useFieldArray({ control, name: 'buttons' });
  const attachments = useFieldArray({ control, name: 'attachments' });

  return (
    <Form {...form}>
      <div className="p-4 space-y-4">
        {/* ── Destination ───────────────────────────────────────────── */}
        <Form.Field
          control={control}
          name="target"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('discord-action.send-to', 'Send to')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="conversation">
                    {t(
                      'discord-action.reply-to-triggering-conversation',
                      'Reply to the triggering conversation',
                    )}
                  </Select.Item>
                  <Select.Item value="channel">
                    {t(
                      'discord-action.a-specific-channel',
                      'A specific channel',
                    )}
                  </Select.Item>
                  <Select.Item value="dm">
                    {t('discord-action.a-direct-message', 'A direct message')}
                  </Select.Item>
                </Select.Content>
              </Select>
              <Form.Description>
                {t(
                  'discord-action.send-to-description',
                  '"Reply to the triggering conversation" needs a conversation trigger; the others send proactively from a chosen bot.',
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />

        {target !== 'conversation' && (
          <Form.Field
            control={control}
            name="botId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('discord-action.bot', 'Bot')}</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value
                      placeholder={t('select-a-bot', 'Select a bot')}
                    />
                  </Select.Trigger>
                  <Select.Content>
                    {bots.map((bot) => (
                      <Select.Item key={bot._id} value={bot._id}>
                        {bot.name || bot._id}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}

        {target === 'channel' && (
          <Form.Field
            control={control}
            name="channelId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('discord-action.channel', 'Channel')}
                </Form.Label>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!botId}
                >
                  <Select.Trigger>
                    <Select.Value
                      placeholder={
                        botId
                          ? t(
                              'discord-action.select-a-channel',
                              'Select a channel',
                            )
                          : t(
                              'discord-action.select-a-bot-first',
                              'Select a bot first',
                            )
                      }
                    />
                  </Select.Trigger>
                  <Select.Content>
                    {channels.map((channel) => (
                      <Select.Item key={channel.id} value={channel.id}>
                        #{channel.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}

        {target === 'dm' && (
          <Form.Field
            control={control}
            name="userId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('discord-action.discord-user-id', 'Discord user ID')}
                </Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder={t(
                      'discord-action.discord-user-id-placeholder',
                      'e.g. 123456789012345678',
                    )}
                  />
                </Form.Control>
                <Form.Description>
                  {t(
                    'discord-action.discord-user-id-description',
                    "The bot must share a server with this user to DM them. DM replies are sent on Discord but aren't shown in the inbox.",
                  )}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}

        {/* ── Message text ──────────────────────────────────────────── */}
        <Form.Field
          control={control}
          name="content"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('discord-action.message', 'Message')}</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value || ''}
                onChange={field.onChange}
                variant="expression"
              >
                <PlaceholderInput.Header />
              </PlaceholderInput>
              <Form.Description>
                {t(
                  'discord-action.message-description',
                  "Insert an AI Agent output variable to reply with the agent's response. Optional if you add an embed, button or attachment.",
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />

        {/* ── Embed (optional) ──────────────────────────────────────── */}
        <SectionLabel>
          {t('discord-action.embed-optional', 'Embed (optional)')}
        </SectionLabel>
        <Form.Field
          control={control}
          name="embed.title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('title-label', 'Title')}</Form.Label>
              <Form.Control>
                <Input {...field} value={field.value || ''} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="embed.description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('description', 'Description')}</Form.Label>
              <Form.Control>
                <Textarea {...field} value={field.value || ''} rows={3} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <Form.Field
            control={control}
            name="embed.color"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('discord-action.color', 'Color')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="#5865F2"
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="embed.imageUrl"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('discord-action.image-url', 'Image URL')}
                </Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder={t(
                      'discord-action.url-placeholder',
                      'https://…',
                    )}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>

        {/* ── Link buttons (optional) ───────────────────────────────── */}
        <SectionLabel>
          {t('discord-action.link-buttons-optional', 'Link buttons (optional)')}
        </SectionLabel>
        <div className="space-y-2">
          {buttons.fields.map((row, index) => (
            <div key={row.id} className="flex items-end gap-2">
              <Form.Field
                control={control}
                name={`buttons.${index}.label`}
                render={({ field }) => (
                  <Form.Item className="flex-1">
                    <Form.Control>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder={t('field-label', 'Label')}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name={`buttons.${index}.url`}
                render={({ field }) => (
                  <Form.Item className="flex-1">
                    <Form.Control>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder={t(
                          'discord-action.url-placeholder',
                          'https://…',
                        )}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => buttons.remove(index)}
              >
                <IconTrash />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => buttons.append({ label: '', url: '' })}
          >
            <IconPlus />
            {t('discord-action.add-button', 'Add button')}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t(
              'discord-action.link-buttons-hint',
              'Only link buttons are supported (they open a URL). Interactive buttons need the Discord interactions endpoint.',
            )}
          </p>
        </div>

        {/* ── Attachments (optional) ────────────────────────────────── */}
        <SectionLabel>
          {t('discord-action.attachments-optional', 'Attachments (optional)')}
        </SectionLabel>
        <div className="space-y-2">
          {attachments.fields.map((row, index) => (
            <div key={row.id} className="flex items-end gap-2">
              <Form.Field
                control={control}
                name={`attachments.${index}.url`}
                render={({ field }) => (
                  <Form.Item className="flex-1">
                    <Form.Control>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder={t(
                          'discord-action.file-url-placeholder',
                          'File URL (https://…)',
                        )}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => attachments.remove(index)}
              >
                <IconTrash />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => attachments.append({ url: '', filename: '' })}
          >
            <IconPlus />
            {t('discord-action.add-attachment', 'Add attachment')}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t(
              'discord-action.attachments-hint',
              'Each URL is fetched and uploaded to Discord (max 8MB per file).',
            )}
          </p>
        </div>
      </div>
    </Form>
  );
};
