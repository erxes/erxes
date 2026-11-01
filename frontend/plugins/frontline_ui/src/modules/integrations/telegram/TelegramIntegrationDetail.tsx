import {
  IntegrationFormItem,
  IntegrationCreateButton,
  IntegrationEditButton,
  useIntegrationChannelId,
} from '@/integrations/components/IntegrationPanelForm';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconBrandTelegram, IconSettings } from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  Form,
  Input,
  REACT_APP_API_URL,
  Select,
  Sheet,
  Spinner,
  toast,
  useConfirm,
} from 'erxes-ui';
import { atom, useAtom, useSetAtom } from 'jotai';
import { type ComponentType, type ReactNode, useEffect, useState } from 'react';
import { type Control, useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { SelectBrand } from 'ui-modules';
import { z } from 'zod';
import { ADD_INTEGRATION } from '@/integrations/graphql/mutations/AddIntegration';
import type { IIntegration } from '@/integrations/types/Integration';
import {
  TELEGRAM_ADD_BOT,
  TELEGRAM_BOTS,
  TELEGRAM_DISCONNECT,
  TELEGRAM_SET_WEBHOOK,
  TELEGRAM_UPDATE_BOT,
  TELEGRAM_WEBHOOK_INFO,
  type TelegramBot,
  type TelegramWebhookInfo,
} from './graphql';
import { useTelegramTranslation } from './translations';
import {
  getTelegramDefaultServerAddress,
  getTelegramServerAddress,
  getTelegramWebhookUrl,
} from './webhookUrl';

const telegramSetupState = atom<string | null>();
type TelegramPresentation = 'sheet' | 'panel';
type TelegramFormItemProps = { label: ReactNode; children: ReactNode };

/** Validates the public callback address before any bot setup mutation. */
const getSetupSchema = (callbackError: string) =>
  z.object({
    botId: z.string(),
    name: z.string().trim(),
    brandId: z.string(),
    token: z.string(),
    url: z
      .string()
      .trim()
      .refine((value) => Boolean(getTelegramServerAddress(value)), {
        message: callbackError,
      }),
  });
type SetupValues = z.infer<ReturnType<typeof getSetupSchema>>;

type TelegramSetupFieldProps = {
  control: Control<SetupValues>;
  FormItem: ComponentType<TelegramFormItemProps>;
};

/** Preserves the standalone sheet's field labels around the shared setup controls. */
const TelegramFormItem = ({ label, children }: TelegramFormItemProps) => (
  <Form.Item>
    <Form.Label>{label}</Form.Label>
    {children}
  </Form.Item>
);

/** Resolves the same saved, integration-linked or selected bot in priority order. */
const getSetupBot = (
  bots: TelegramBot[] | undefined,
  savedBot: TelegramBot | undefined,
  integrationId: string | null,
  chosenId: string,
): TelegramBot | undefined => {
  if (savedBot)
    return bots?.find((item) => item._id === savedBot._id) ?? savedBot;
  if (integrationId)
    return bots?.find((item) => item.erxesApiId === integrationId);
  return bots?.find((item) => item._id === chosenId);
};

/** Opens setup for the integration selected in the native integrations table. */
export const TelegramIntegrationActions = ({
  integration,
  presentation = 'sheet',
}: {
  integration: IIntegration;
  presentation?: TelegramPresentation;
}) => {
  const setOpen = useSetAtom(telegramSetupState);
  const { t } = useTelegramTranslation();
  return presentation === 'panel' ? (
    <IntegrationEditButton integration={integration} />
  ) : (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => setOpen(integration._id)}
    >
      <IconSettings className="size-4" />
      {t('configure')}
    </Button>
  );
};

/** Renders bot identity, credentials and the inbox fields before linking. */
const TelegramBotFields = ({
  control,
  FormItem,
  bot,
  bots,
  showBotPicker,
}: TelegramSetupFieldProps & {
  bot?: TelegramBot;
  bots?: TelegramBot[];
  showBotPicker: boolean;
}) => {
  const { t } = useTelegramTranslation();
  const needsLink = !bot?.erxesApiId;
  return (
    <>
      {showBotPicker && (
        <Form.Field
          control={control}
          name="botId"
          render={({ field }) => (
            <FormItem label={t('bot')}>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  <Select.Item value="new">{t('newBot')}</Select.Item>
                  {bots
                    ?.filter((item) => !item.erxesApiId)
                    .map((item) => (
                      <Select.Item key={item._id} value={item._id}>
                        {item.botName}{' '}
                        {item.botUsername ? `(@${item.botUsername})` : ''}
                      </Select.Item>
                    ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </FormItem>
          )}
        />
      )}
      {bot && (
        <p className="font-medium">
          {bot.botName} {bot.botUsername ? `(@${bot.botUsername})` : ''}
        </p>
      )}
      <Form.Field
        control={control}
        name="token"
        render={({ field }) => (
          <FormItem label={bot ? t('replacementToken') : t('token')}>
            <Form.Control>
              <Input {...field} type="password" autoComplete="new-password" />
            </Form.Control>
            <Form.Description>{t('tokenHint')}</Form.Description>
            <Form.Message />
          </FormItem>
        )}
      />
      {needsLink && (
        <>
          <Form.Field
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem label={t('name')}>
                <Form.Control>
                  <Input
                    {...field}
                    placeholder={bot?.botName || t('namePlaceholder')}
                  />
                </Form.Control>
                <Form.Description>{t('nameHint')}</Form.Description>
                <Form.Message />
              </FormItem>
            )}
          />
          <Form.Field
            control={control}
            name="brandId"
            render={({ field }) => (
              <FormItem label={t('brand')}>
                <Form.Control>
                  <SelectBrand
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('chooseBrand')}
                    className="w-full"
                  />
                </Form.Control>
                <Form.Message />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
};

/** Keeps the public callback override and generated webhook preview together. */
const TelegramConnectionSettings = ({
  control,
  FormItem,
  bot,
  status,
  statusError,
  defaultAddress,
  open,
  onOpenChange,
}: TelegramSetupFieldProps & {
  bot?: TelegramBot;
  status?: TelegramWebhookInfo;
  statusError: boolean;
  defaultAddress: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTelegramTranslation();
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Collapsible.Trigger asChild>
        <Button type="button" variant="ghost" className="gap-2 px-0">
          <Collapsible.TriggerIcon />
          {t('connectionSettings')}
        </Button>
      </Collapsible.Trigger>
      <p className="text-sm text-muted-foreground mb-3">
        {status?.url
          ? t('callbackSaved')
          : statusError
            ? t('statusFailed')
            : defaultAddress
              ? t('callbackDetected')
              : t('callbackLocal')}
      </p>
      <Collapsible.Content>
        <Form.Field
          control={control}
          name="url"
          render={({ field }) => (
            <FormItem label={t('callback')}>
              <Form.Control>
                <Input
                  {...field}
                  type="url"
                  placeholder="https://your-public-frontline-host"
                />
              </Form.Control>
              <Form.Description>
                {t('callbackHint')}
                <span className="block mt-1">{t('callbackAutomatic')}</span>
                <span className="block mt-2 font-medium">
                  {t('callbackPreview')}
                </span>
                <code className="block break-all">
                  {getTelegramWebhookUrl(
                    field.value || 'https://your-public-frontline-host',
                    bot?._id ?? '{bot-id}',
                  ) ?? `/telegram/receive/${bot?._id ?? '{bot-id}'}`}
                </code>
                {!bot && (
                  <span className="block mt-1">{t('callbackPending')}</span>
                )}
              </Form.Description>
              <Form.Message />
            </FormItem>
          )}
        />
      </Collapsible.Content>
    </Collapsible>
  );
};

/** Displays the saved webhook and provider delivery diagnostics without changing them. */
const TelegramWebhookDiagnostics = ({
  status,
}: {
  status?: TelegramWebhookInfo;
}) => {
  const { t } = useTelegramTranslation();
  if (!status) return null;
  return (
    <>
      <p>{status.url ? t('registered') : t('unregistered')}</p>
      <p className="break-all text-muted-foreground">{status.url}</p>
      <p>
        {t('pending')}: {status.pendingUpdateCount}
      </p>
      {status.url &&
        [
          'message',
          'channel_post',
          'edited_message',
          'edited_channel_post',
          'poll',
          'message_reaction',
          'message_reaction_count',
        ].some((type) => !status.allowedUpdates?.includes(type)) && (
          <p className="text-warning">{t('channelUpdates')}</p>
        )}
      {status.lastErrorMessage && (
        <div className="text-muted-foreground">
          <p>
            {t('lastError')}: {status.lastErrorMessage}
          </p>
          <p>
            {status.lastErrorDate &&
              new Date(status.lastErrorDate).toLocaleString()}
          </p>
          <p>{t('oldError')}</p>
        </div>
      )}
    </>
  );
};

/** Leaves refresh and disconnect available even when webhook status fails. */
const TelegramWebhookStatus = ({
  status,
  loading,
  failed,
  busy,
  refreshStatus,
  disconnectBot,
}: {
  status?: TelegramWebhookInfo;
  loading: boolean;
  failed: boolean;
  busy: boolean;
  refreshStatus: () => Promise<void>;
  disconnectBot: () => Promise<void>;
}) => {
  const { t } = useTelegramTranslation();
  return (
    <div className="rounded-md border p-3 space-y-2 text-sm">
      <p className="font-medium">{t('status')}</p>
      {loading ? (
        <Spinner />
      ) : failed ? (
        <p role="alert">{t('statusFailed')}</p>
      ) : (
        <TelegramWebhookDiagnostics status={status} />
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={refreshStatus}
        >
          {t('refresh')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={disconnectBot}
        >
          {t('disconnect')}
        </Button>
      </div>
    </div>
  );
};

/** Preserves the provider's privacy, group, channel and media guidance. */
const TelegramGroupHints = ({ bot }: { bot?: TelegramBot }) => {
  const { t } = useTelegramTranslation();
  return (
    <div className="text-sm text-muted-foreground space-y-2">
      <h3 className="font-semibold text-foreground">{t('groups')}</h3>
      {bot && (
        <p>
          {bot.canJoinGroups === false
            ? t('noGroups')
            : bot.canReadAllGroupMessages
              ? t('privacyOff')
              : t('privacyOn')}
        </p>
      )}
      <p>{t('groupHint')}</p>
      <p>{t('channelHint')}</p>
      <p>{t('files')}</p>
      <p>{t('internal')}</p>
    </div>
  );
};

/** Shows loading, retry and missing-record states before setup fields. */
const TelegramSetupContent = ({
  loading,
  failed,
  missing,
  retry,
  children,
}: {
  loading: boolean;
  failed: boolean;
  missing: boolean;
  retry: () => void;
  children: ReactNode;
}) => {
  const { t } = useTelegramTranslation();
  if (loading)
    return (
      <div className="flex gap-2">
        <Spinner />
        {t('loading')}
      </div>
    );
  if (failed)
    return (
      <div role="alert">
        {t('loadError')}
        <Button type="button" variant="ghost" onClick={retry}>
          {t('retry')}
        </Button>
      </div>
    );
  if (missing) return <p role="alert">{t('missing')}</p>;
  return children;
};

/** Shares the cancellation and save/connect controls between both presentations. */
const TelegramSetupFooter = ({
  integrationId,
  busy,
  disabled,
}: {
  integrationId: string | null;
  busy: boolean;
  disabled: boolean;
}) => {
  const { t } = useTelegramTranslation();
  return (
    <Sheet.Footer className="h-auto min-h-12 shrink-0 border-t px-2 gap-1">
      <Sheet.Close asChild>
        <Button type="button" variant="ghost" className="mr-auto">
          {t('cancel')}
        </Button>
      </Sheet.Close>
      <Button type="submit" disabled={disabled}>
        {busy && <Spinner size="sm" />}
        {integrationId ? t('save') : t('connect')}
      </Button>
    </Sheet.Footer>
  );
};

/** Runs resumable bot verification, inbox linking and webhook registration. */
const TelegramSetupForm = ({
  integrationId,
  channelId,
  FormItem,
}: {
  integrationId: string | null;
  channelId?: string;
  FormItem: ComponentType<TelegramFormItemProps>;
}) => {
  const { t } = useTelegramTranslation();
  const client = useApolloClient();
  const { confirm } = useConfirm();
  const [savedBot, setSavedBot] = useState<TelegramBot>();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<'saved' | 'linked' | undefined>();
  const defaultAddress = getTelegramDefaultServerAddress(REACT_APP_API_URL);
  const [showAddress, setShowAddress] = useState(!defaultAddress);
  const botsQuery = useQuery(TELEGRAM_BOTS, {
    fetchPolicy: 'cache-and-network',
  });
  const form = useForm<SetupValues>({
    resolver: zodResolver(getSetupSchema(t('callbackInvalid'))),
    defaultValues: {
      botId: 'new',
      name: '',
      brandId: '',
      token: '',
      url: integrationId ? '' : (defaultAddress ?? ''),
    },
  });
  const chosenId = form.watch('botId');
  const bot = getSetupBot(
    botsQuery.data?.telegramBots,
    savedBot,
    integrationId,
    chosenId,
  );
  const needsLink = !bot?.erxesApiId;
  const statusQuery = useQuery(TELEGRAM_WEBHOOK_INFO, {
    variables: { _id: bot?._id ?? '' },
    skip: !bot?.erxesApiId,
    fetchPolicy: 'network-only',
  });
  const status = statusQuery.data?.telegramBotWebhookInfo;
  useEffect(() => {
    if (status && !form.getFieldState('url').isDirty)
      form.setValue(
        'url',
        status.url
          ? (getTelegramServerAddress(status.url) ?? status.url)
          : (defaultAddress ?? ''),
      );
  }, [status, defaultAddress, form]);
  const [addBot] = useMutation(TELEGRAM_ADD_BOT);
  const [updateBot] = useMutation(TELEGRAM_UPDATE_BOT);
  const [register] = useMutation(TELEGRAM_SET_WEBHOOK);
  const [disconnect] = useMutation(TELEGRAM_DISCONNECT);
  const [addIntegration] = useMutation(ADD_INTEGRATION);

  /** Refetches active setup and inbox queries after connection changes. */
  const refresh = async (): Promise<void> => {
    const names = new Set([
      'frontlineTelegramSetupBots',
      'frontlineTelegramSetupWebhookInfo',
      'Integrations',
      'IntegrationsTotalCount',
      'IntegrationsGetUsedTypes',
      'IntegrationsGetUsedTypesByChannel',
      'GetMyChannels',
    ]);
    await client.refetchQueries({
      include: 'active',
      onQueryUpdated: (query) =>
        names.has(query.queryName ?? '') ? query.refetch() : false,
    });
  };
  /** Shows actionable setup failures without discarding the entered form values. */
  const reportError = (error: unknown): void => {
    toast({
      title: t('failed'),
      description: error instanceof Error ? error.message : t('retry'),
      variant: 'destructive',
    });
  };
  /** Verifies new or replacement credentials and clears only a saved token. */
  const saveBot = async (token: string): Promise<TelegramBot> => {
    if (!bot) {
      const result = await addBot({ variables: { token } });
      const current = result.data?.telegramAddBot;
      if (!current) throw new Error(t('failed'));
      setSavedBot(current);
      form.setValue('token', '');
      setProgress('saved');
      return current;
    }
    if (!token) return bot;
    const result = await updateBot({ variables: { _id: bot._id, token } });
    if (!result.data) throw new Error(t('failed'));
    const current = result.data.telegramUpdateBot;
    setSavedBot(current);
    form.setValue('token', '');
    return current;
  };
  /** Reconciles an interrupted create before attempting another inbox link. */
  const linkInbox = async (
    saved: TelegramBot,
    values: SetupValues,
  ): Promise<TelegramBot> => {
    if (saved.erxesApiId) return saved;
    const { data } = await botsQuery.refetch();
    const current = data.telegramBots.find((item) => item._id === saved._id);
    if (!current) throw new Error(t('missing'));
    setSavedBot(current);
    if (current.erxesApiId) return current;
    const result = await addIntegration({
      variables: {
        kind: 'telegram-messenger',
        name:
          values.name || current.botName || current.botUsername || 'Telegram',
        brandId: values.brandId,
        channelId: channelId ?? '',
        data: { sourceBotId: current._id },
      },
    });
    const createdId = result.data?.integrationsCreateExternalIntegration?._id;
    if (!createdId) throw new Error(t('failed'));
    const linked = { ...current, erxesApiId: createdId };
    setSavedBot(linked);
    setProgress('linked');
    return linked;
  };
  /** Runs verification, resumable linking and webhook registration in order. */
  const submit = async (values: SetupValues): Promise<void> => {
    if (needsLink && !values.brandId) {
      form.setError('brandId', { message: t('chooseBrand') });
      return;
    }
    if (!bot && !values.token) {
      form.setError('token', { message: t('tokenHint') });
      return;
    }
    setBusy(true);
    try {
      const saved = await saveBot(values.token);
      const current = await linkInbox(saved, values);
      const url = getTelegramWebhookUrl(values.url, current._id);
      if (!url) throw new Error(t('callbackInvalid'));
      const result = await register({
        variables: { _id: current._id, url },
      });
      if (!result.data?.telegramSetWebhook) throw new Error(t('failed'));
      form.setValue('url', getTelegramServerAddress(url) ?? values.url);
      setProgress(undefined);
      toast({ title: t('success') });
    } catch (error: unknown) {
      reportError(error);
    } finally {
      await refresh().catch(reportError);
      setBusy(false);
    }
  };
  /** Re-verifies bot capabilities and reloads webhook diagnostics. */
  const refreshStatus = async (): Promise<void> => {
    if (!bot) return;
    setBusy(true);
    try {
      const result = await updateBot({ variables: { _id: bot._id } });
      if (result.data) setSavedBot(result.data.telegramUpdateBot);
      await refresh();
    } catch (error: unknown) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };
  /** Confirms disconnection and distinguishes local deactivation from remote cleanup. */
  const disconnectBot = async (): Promise<void> => {
    if (!bot) return;
    try {
      await confirm({ message: t('disconnectPrompt') });
    } catch {
      return;
    }
    setBusy(true);
    try {
      const result = await disconnect({ variables: { _id: bot._id } });
      if (!result.data) throw new Error(t('failed'));
      // A revoked token also makes the status query fail; the query displays
      // that error independently of the completed local disconnection.
      await refresh().catch(() => undefined);
      toast({
        title: t('disconnected'),
        description: result.data.telegramDisconnectBot
          ? undefined
          : t('disconnectCleanupPending'),
      });
    } catch (error: unknown) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit, (errors) => {
          if (errors.url) setShowAddress(true);
        })}
        className="flex flex-col flex-auto overflow-hidden"
      >
        <Sheet.Content className="overflow-auto p-4 space-y-5 styled-scroll">
          <TelegramSetupContent
            loading={botsQuery.loading && !botsQuery.data}
            failed={Boolean(botsQuery.error)}
            missing={Boolean(integrationId && !bot)}
            retry={() => {
              botsQuery.refetch().catch(reportError);
            }}
          >
            <TelegramBotFields
              control={form.control}
              FormItem={FormItem}
              bot={bot}
              bots={botsQuery.data?.telegramBots}
              showBotPicker={!integrationId && !savedBot}
            />
            {progress && (
              <p role="status" className="text-sm text-muted-foreground">
                {t(progress)}
              </p>
            )}
            <TelegramConnectionSettings
              control={form.control}
              FormItem={FormItem}
              bot={bot}
              status={status}
              statusError={Boolean(statusQuery.error)}
              defaultAddress={defaultAddress}
              open={showAddress}
              onOpenChange={setShowAddress}
            />
            {bot?.erxesApiId && (
              <TelegramWebhookStatus
                status={status}
                loading={statusQuery.loading}
                failed={Boolean(statusQuery.error)}
                busy={busy}
                refreshStatus={refreshStatus}
                disconnectBot={disconnectBot}
              />
            )}
          </TelegramSetupContent>
          <TelegramGroupHints bot={bot} />
        </Sheet.Content>
        <TelegramSetupFooter
          integrationId={integrationId}
          busy={busy}
          disabled={
            busy ||
            botsQuery.loading ||
            Boolean(bot?.erxesApiId && statusQuery.loading) ||
            Boolean(botsQuery.error) ||
            Boolean(integrationId && !bot)
          }
        />
      </form>
    </Form>
  );
};

/** Supplies record-panel channel context and field layout to the shared setup form. */
export const TelegramSetup = ({
  integrationId,
}: {
  integrationId: string | null;
}) => {
  const channelId = useIntegrationChannelId();
  return (
    <TelegramSetupForm
      integrationId={integrationId}
      channelId={channelId}
      FormItem={IntegrationFormItem}
    />
  );
};

/** Hosts the existing standalone create and configure entry points in a sheet. */
const TelegramSetupSheet = ({ showTrigger }: { showTrigger: boolean }) => {
  const [integrationId, setIntegrationId] = useAtom(telegramSetupState);
  const { id: channelId } = useParams();
  const { t } = useTelegramTranslation();
  return (
    <Sheet
      open={integrationId !== undefined}
      onOpenChange={(open) => setIntegrationId(open ? null : undefined)}
    >
      {showTrigger && (
        <Sheet.Trigger asChild>
          <Button>
            <IconBrandTelegram />
            {t('connect')}
          </Button>
        </Sheet.Trigger>
      )}
      <Sheet.View className="sm:max-w-2xl">
        {integrationId !== undefined && (
          <>
            <Sheet.Header>
              <Sheet.Title>
                {integrationId ? t('configure') : t('connect')}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <TelegramSetupForm
              key={integrationId ?? 'new'}
              integrationId={integrationId}
              channelId={channelId}
              FormItem={TelegramFormItem}
            />
          </>
        )}
      </Sheet.View>
    </Sheet>
  );
};

/**
 * Owns the shared connection sheet for new and existing Telegram bots. Hosts
 * that only edit existing bots mount it without the connect trigger.
 */
export const TelegramIntegrationDetail = ({
  showTrigger = true,
  presentation = 'sheet',
}: {
  showTrigger?: boolean;
  presentation?: TelegramPresentation;
}) => {
  const { t } = useTelegramTranslation();
  if (presentation === 'panel') {
    return showTrigger ? (
      <IntegrationCreateButton kind="telegram-messenger">
        {t('connect')}
      </IntegrationCreateButton>
    ) : null;
  }
  return <TelegramSetupSheet showTrigger={showTrigger} />;
};
