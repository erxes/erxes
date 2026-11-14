import {
  createIntegrationDraftState,
  createIntegrationFormDraft,
  useIntegrationDraftSession,
} from '@/integrations/hooks/useIntegrationDraft';
import { useSidePanel, SelectBrand } from 'ui-modules';
import {
  IntegrationCreateButton,
  INTEGRATION_CONTENT_TYPE,
  useIntegrationChannelId,
} from '@/integrations/components/IntegrationPanelForm';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconSettings } from '@tabler/icons-react';
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
import { useEffect, useState } from 'react';
import { useSocialIntegrationCreate } from '@/integrations/hooks/useSocialIntegrationCreate';
import { useForm, UseFormReturn } from 'react-hook-form';

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

/** Validates the public callback address before bot setup mutations. */
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

const useFormDraft = createIntegrationFormDraft<SetupValues>();
const useSavedBot = createIntegrationDraftState<TelegramBot | undefined>(
  () => undefined,
);
const useProgress = createIntegrationDraftState<'saved' | 'linked' | undefined>(
  () => undefined,
);

/** Opens configuration for the selected Telegram integration. */
export const TelegramIntegrationActions = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  const { openRecord } = useSidePanel();
  const { t } = useTelegramTranslation();
  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() =>
        openRecord({
          contentType: INTEGRATION_CONTENT_TYPE,
          contentId: integration._id,
        })
      }
    >
      <IconSettings className="size-4" />
      {t('configure')}
    </Button>
  );
};

/** Displays webhook delivery status and the existing refresh and disconnect actions. */
const TelegramWebhookStatus = ({
  status,
  loading,
  error,
  busy,
  onRefresh,
  onDisconnect,
}: {
  status?: TelegramWebhookInfo;
  loading: boolean;
  error: boolean;
  busy: boolean;
  onRefresh: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}) => {
  const { t } = useTelegramTranslation();
  const statusDetails = !loading && !error && status && (
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
  return (
    <div className="rounded-md border p-3 space-y-2 text-sm">
      <p className="font-medium">{t('status')}</p>
      {loading && <Spinner />}
      {!loading && error && <p role="alert">{t('statusFailed')}</p>}
      {statusDetails}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={onRefresh}
        >
          {t('refresh')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={onDisconnect}
        >
          {t('disconnect')}
        </Button>
      </div>
    </div>
  );
};

/** Composes the existing bot, integration, and callback fields for Telegram setup. */
const TelegramSetupFields = ({
  form,
  bot,
  bots,
  integrationId,
  savedBot,
  needsLink,
  progress,
  showAddress,
  onShowAddressChange,
  callbackDescriptionKey,
  children,
}: {
  form: UseFormReturn<SetupValues>;
  bot?: TelegramBot;
  bots?: TelegramBot[];
  integrationId: string | null;
  savedBot?: TelegramBot;
  needsLink: boolean;
  progress?: 'saved' | 'linked';
  showAddress: boolean;
  onShowAddressChange: (open: boolean) => void;
  callbackDescriptionKey: Parameters<
    ReturnType<typeof useTelegramTranslation>['t']
  >[0];
  children: React.ReactNode;
}) => {
  const { t } = useTelegramTranslation();
  const botTrigger = (
    <Form.Control>
      <Select.Trigger>
        <Select.Value />
      </Select.Trigger>
    </Form.Control>
  );

  const botOptions = (
    <Select.Content>
      <Select.Item value="new">{t('newBot')}</Select.Item>
      {bots
        ?.filter((item) => !item.erxesApiId)
        .map((item) => (
          <Select.Item key={item._id} value={item._id}>
            {item.botName} {item.botUsername ? `(@${item.botUsername})` : ''}
          </Select.Item>
        ))}
    </Select.Content>
  );

  const botSelector = (
    <Form.Field
      control={form.control}
      name="botId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('bot')}</Form.Label>
          <Select value={field.value} onValueChange={field.onChange}>
            {botTrigger}
            {botOptions}
          </Select>
          <Form.Message />
        </Form.Item>
      )}
    />
  );

  const tokenField = (
    <Form.Field
      control={form.control}
      name="token"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{bot ? t('replacementToken') : t('token')}</Form.Label>
          <Form.Control>
            <Input {...field} type="password" autoComplete="new-password" />
          </Form.Control>
          <Form.Description>{t('tokenHint')}</Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );

  const nameField = (
    <Form.Field
      control={form.control}
      name="name"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('name')}</Form.Label>
          <Form.Control>
            <Input
              {...field}
              placeholder={bot?.botName || t('namePlaceholder')}
            />
          </Form.Control>
          <Form.Description>{t('nameHint')}</Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );

  const brandField = (
    <Form.Field
      control={form.control}
      name="brandId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('brand')}</Form.Label>
          <Form.Control>
            <SelectBrand
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t('chooseBrand')}
              className="w-full"
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );

  const callbackField = (
    <Form.Field
      control={form.control}
      name="url"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('callback')}</Form.Label>
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
            {!bot && <span className="block mt-1">{t('callbackPending')}</span>}
          </Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );

  const connectionSettings = (
    <Collapsible open={showAddress} onOpenChange={onShowAddressChange}>
      <Collapsible.Trigger asChild>
        <Button type="button" variant="ghost" className="gap-2 px-0">
          <Collapsible.TriggerIcon />
          {t('connectionSettings')}
        </Button>
      </Collapsible.Trigger>
      <p className="text-sm text-muted-foreground mb-3">
        {t(callbackDescriptionKey)}
      </p>
      <Collapsible.Content>{callbackField}</Collapsible.Content>
    </Collapsible>
  );
  return (
    <>
      {!integrationId && !savedBot && botSelector}
      {bot && (
        <p className="font-medium">
          {bot.botName} {bot.botUsername ? `(@${bot.botUsername})` : ''}
        </p>
      )}
      {tokenField}
      {needsLink && (
        <>
          {nameField}
          {brandField}
        </>
      )}
      {progress && (
        <p role="status" className="text-sm text-muted-foreground">
          {t(progress)}
        </p>
      )}
      {connectionSettings}
      {children}
    </>
  );
};

/** Loads Telegram setup state and coordinates bot, integration, and webhook mutations. */
export const TelegramSetup = ({
  integrationId,
}: {
  integrationId: string | null;
}) => {
  const channelId = useIntegrationChannelId();
  const { t } = useTelegramTranslation();
  const client = useApolloClient();
  const { confirm } = useConfirm();
  const [savedBot, setSavedBot] = useSavedBot();
  const { captureRevision } = useIntegrationDraftSession();
  const [completedBot, setCompletedBot] = useState<TelegramBot>();
  const selectedBot = completedBot ?? savedBot;
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useProgress();
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
  const { markSaved, clearDraft, clearSession, beginSave, endSave, saving } =
    useFormDraft(form);
  const {
    runCreate,
    createdId,
    loading: creating,
  } = useSocialIntegrationCreate();
  const { openRecord, record } = useSidePanel();
  useEffect(() => {
    if (
      !integrationId &&
      createdId &&
      !creating &&
      record?.contentId !== createdId
    )
      openRecord(
        { contentType: INTEGRATION_CONTENT_TYPE, contentId: createdId },
        { replace: true },
      );
  }, [integrationId, createdId, creating, record, openRecord]);
  const chosenId = form.watch('botId');
  const bot =
    botsQuery.data?.telegramBots.find((item) => {
      if (selectedBot) return item._id === selectedBot._id;
      if (integrationId) return item.erxesApiId === integrationId;
      return item._id === chosenId;
    }) ?? selectedBot;
  const needsLink = !bot?.erxesApiId;
  const statusQuery = useQuery(TELEGRAM_WEBHOOK_INFO, {
    variables: { _id: bot?._id ?? '' },
    skip: needsLink,
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

  /** Refetches active bot, webhook, integration, and channel queries after setup changes. */
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

  /** Shows setup failures with a fallback message for unknown errors. */
  const reportError = (error: unknown): void => {
    toast({
      title: t('failed'),
      description: error instanceof Error ? error.message : t('retry'),
      variant: 'destructive',
    });
  };

  /** Links the bot and integration, registers its webhook, and refreshes setup state. */
  const submit = async (values: SetupValues): Promise<void> => {
    if (needsLink && !values.brandId) {
      form.setError('brandId', { message: t('chooseBrand') });
      return;
    }
    if (!bot && !values.token) {
      form.setError('token', { message: t('tokenHint') });
      return;
    }
    const saveId = beginSave();
    if (saveId === undefined) return;
    setBusy(true);
    const perform = async (): Promise<string> => {
      let current = bot;
      if (!current) {
        const result = await addBot({ variables: { token: values.token } });
        current = result.data?.telegramAddBot;
        if (!current) throw new Error(t('failed'));
        setSavedBot(current);
        form.setValue('token', '');
        setProgress('saved');
      } else if (values.token) {
        const result = await updateBot({
          variables: { _id: current._id, token: values.token },
        });
        if (!result.data) throw new Error(t('failed'));
        current = result.data.telegramUpdateBot;
        setSavedBot(current);
        form.setValue('token', '');
      }
      if (!current.erxesApiId) {
        const { data } = await botsQuery.refetch();
        const reconciled = data.telegramBots.find(
          (item) => item._id === current?._id,
        );
        if (!reconciled) throw new Error(t('missing'));
        current = reconciled;
        setSavedBot(current);
      }
      if (!current.erxesApiId) {
        const result = await addIntegration({
          variables: {
            kind: 'telegram-messenger',
            name:
              values.name ||
              current.botName ||
              current.botUsername ||
              'Telegram',
            brandId: values.brandId,
            channelId: channelId ?? '',
            data: { sourceBotId: current._id },
          },
        });
        const createdId =
          result.data?.integrationsCreateExternalIntegration?._id;
        if (!createdId) throw new Error(t('failed'));
        current = {
          ...current,
          erxesApiId: createdId,
        };
        setSavedBot(current);
        setProgress('linked');
      }
      const url = getTelegramWebhookUrl(values.url, current._id);
      if (!url) throw new Error(t('callbackInvalid'));
      const result = await register({
        variables: { _id: current._id, url },
      });
      if (!result.data?.telegramSetWebhook) throw new Error(t('failed'));
      form.setValue('url', getTelegramServerAddress(url) ?? values.url);
      setCompletedBot(current);
      markSaved(form.getValues());
      clearDraft();
      if (integrationId) clearSession();
      toast({ title: t('success') });
      if (!current.erxesApiId) throw new Error(t('failed'));
      return current.erxesApiId;
    };
    try {
      if (integrationId) await perform();
      else await runCreate(perform, reportError);
    } catch (error: unknown) {
      reportError(error);
    } finally {
      await refresh().catch(reportError);
      endSave(saveId);
      setBusy(false);
    }
  };

  /** Verifies the connected bot and refreshes its webhook status. */
  const refreshStatus = async (): Promise<void> => {
    if (!bot) return;
    const revision = captureRevision();
    setBusy(true);
    try {
      const result = await updateBot({ variables: { _id: bot._id } });
      if (result.data && captureRevision() === revision) {
        if (integrationId || !completedBot)
          setSavedBot(result.data.telegramUpdateBot);
        else setCompletedBot(result.data.telegramUpdateBot);
      }
      await refresh();
    } catch (error: unknown) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  /** Confirms disconnection, removes the bot connection, and refreshes affected queries. */
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

  const loadingBots = botsQuery.loading && !botsQuery.data;
  const missingBot = Boolean(integrationId && !bot);
  let callbackDescriptionKey: Parameters<typeof t>[0] = 'callbackLocal';
  if (defaultAddress) callbackDescriptionKey = 'callbackDetected';
  if (statusQuery.error) callbackDescriptionKey = 'statusFailed';
  if (status?.url) callbackDescriptionKey = 'callbackSaved';
  let groupPermissionKey: Parameters<typeof t>[0] = 'privacyOn';
  if (bot?.canReadAllGroupMessages) groupPermissionKey = 'privacyOff';
  if (bot?.canJoinGroups === false) groupPermissionKey = 'noGroups';

  let setupContent: React.ReactNode;
  if (loadingBots) {
    setupContent = (
      <div className="flex gap-2">
        <Spinner />
        {t('loading')}
      </div>
    );
  } else if (botsQuery.error) {
    setupContent = (
      <div role="alert">
        {t('loadError')}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            botsQuery.refetch().catch(reportError);
          }}
        >
          {t('retry')}
        </Button>
      </div>
    );
  } else if (missingBot) {
    setupContent = <p role="alert">{t('missing')}</p>;
  } else {
    setupContent = (
      <TelegramSetupFields
        form={form}
        bot={bot}
        bots={botsQuery.data?.telegramBots}
        integrationId={integrationId}
        savedBot={selectedBot}
        needsLink={needsLink}
        progress={progress}
        showAddress={showAddress}
        onShowAddressChange={setShowAddress}
        callbackDescriptionKey={callbackDescriptionKey}
      >
        {!needsLink && (
          <TelegramWebhookStatus
            status={status}
            loading={statusQuery.loading}
            error={Boolean(statusQuery.error)}
            busy={busy || saving || creating}
            onRefresh={refreshStatus}
            onDisconnect={disconnectBot}
          />
        )}
      </TelegramSetupFields>
    );
  }
  const groupHints = (
    <div className="text-sm text-muted-foreground space-y-2">
      <h3 className="font-semibold text-foreground">{t('groups')}</h3>
      {bot && <p>{t(groupPermissionKey)}</p>}
      <p>{t('groupHint')}</p>
      <p>{t('channelHint')}</p>
      <p>{t('files')}</p>
      <p>{t('internal')}</p>
    </div>
  );
  const footer = (
    <Sheet.Footer>
      <Sheet.Close asChild>
        <Button type="button" variant="ghost" className="mr-auto">
          {t('cancel')}
        </Button>
      </Sheet.Close>
      <Button
        type="submit"
        disabled={
          busy ||
          saving ||
          creating ||
          botsQuery.loading ||
          Boolean(!needsLink && statusQuery.loading) ||
          Boolean(botsQuery.error) ||
          missingBot
        }
      >
        {busy && <Spinner size="sm" />}
        {integrationId ? t('save') : t('connect')}
      </Button>
    </Sheet.Footer>
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit, (errors) => {
          if (errors.url) setShowAddress(true);
        })}
        className="flex flex-col flex-auto overflow-hidden"
      >
        <Sheet.Content className="overflow-auto p-4 space-y-5 styled-scroll">
          {setupContent}
          {groupHints}
        </Sheet.Content>
        {footer}
      </form>
    </Form>
  );
};

/** Renders the Telegram connection trigger when requested. */
export const TelegramIntegrationDetail = ({
  showTrigger = true,
}: {
  showTrigger?: boolean;
}) => {
  const { t } = useTelegramTranslation();
  return showTrigger ? (
    <IntegrationCreateButton kind="telegram-messenger">
      {t('connect')}
    </IntegrationCreateButton>
  ) : null;
};
