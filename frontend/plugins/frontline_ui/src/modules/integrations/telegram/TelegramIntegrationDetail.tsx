import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconBrandTelegram, IconSettings } from '@tabler/icons-react';
import type { CellContext } from '@tanstack/react-table';
import {
  Button,
  Form,
  Input,
  Select,
  Sheet,
  Spinner,
  toast,
  useConfirm,
} from 'erxes-ui';
import { atom, useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { SelectBrand } from 'ui-modules';
import { z } from 'zod';
import { ADD_INTEGRATION } from '@/integrations/graphql/mutations/AddIntegration';
import type { IIntegrationDetail } from '@/integrations/types/Integration';
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
import { getTelegramServerAddress, getTelegramWebhookUrl } from './webhookUrl';

// undefined: closed, null: new connection, string: configure this integration.
const telegramSetupState = atom<string | null | undefined>(undefined);
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

export const TelegramIntegrationActions = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
  const setOpen = useSetAtom(telegramSetupState);
  const { t } = useTelegramTranslation();
  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => setOpen(cell.row.original._id)}
    >
      <IconSettings className="size-4" />
      {t('configure')}
    </Button>
  );
};

export const TelegramIntegrationDetail = () => {
  const [integrationId, setIntegrationId] = useAtom(telegramSetupState);
  const { t } = useTelegramTranslation();
  return (
    <Sheet
      open={integrationId !== undefined}
      onOpenChange={(open) => setIntegrationId(open ? null : undefined)}
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconBrandTelegram />
          {t('connect')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-2xl">
        {integrationId !== undefined && (
          <TelegramSetup
            key={integrationId ?? 'new'}
            integrationId={integrationId}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};

const TelegramSetup = ({ integrationId }: { integrationId: string | null }) => {
  const { id: channelId } = useParams();
  const { t } = useTelegramTranslation();
  const client = useApolloClient();
  const { confirm } = useConfirm();
  const [savedBot, setSavedBot] = useState<TelegramBot>();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<'saved' | 'linked' | undefined>();
  const botsQuery = useQuery<{ telegramBots: TelegramBot[] }>(TELEGRAM_BOTS, {
    fetchPolicy: 'cache-and-network',
  });
  const form = useForm<SetupValues>({
    resolver: zodResolver(getSetupSchema(t('callbackInvalid'))),
    defaultValues: {
      botId: 'new',
      name: '',
      brandId: '',
      token: '',
      url: '',
    },
  });
  const chosenId = form.watch('botId');
  const bot =
    savedBot ??
    botsQuery.data?.telegramBots.find((item) =>
      integrationId ? item.erxesApiId === integrationId : item._id === chosenId,
    );
  const needsLink = !bot?.erxesApiId;
  const statusQuery = useQuery<{ telegramBotWebhookInfo: TelegramWebhookInfo }>(
    TELEGRAM_WEBHOOK_INFO,
    {
      variables: { _id: bot?._id ?? '' },
      skip: !bot?.erxesApiId,
      fetchPolicy: 'network-only',
    },
  );
  const status = statusQuery.data?.telegramBotWebhookInfo;
  useEffect(() => {
    if (status?.url && !form.getFieldState('url').isDirty)
      form.setValue('url', getTelegramServerAddress(status.url) ?? status.url);
  }, [status?.url, form]);
  const [addBot] = useMutation<{ telegramAddBot: TelegramBot }>(
    TELEGRAM_ADD_BOT,
  );
  const [updateBot] = useMutation<{ telegramUpdateBot: TelegramBot }>(
    TELEGRAM_UPDATE_BOT,
  );
  const [register] = useMutation<{ telegramSetWebhook: boolean }>(
    TELEGRAM_SET_WEBHOOK,
  );
  const [disconnect] = useMutation<{ telegramDisconnectBot: boolean }>(
    TELEGRAM_DISCONNECT,
  );
  const [addIntegration] = useMutation<{
    integrationsCreateExternalIntegration: { _id: string };
  }>(ADD_INTEGRATION);

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
  const reportError = (error: unknown): void => {
    toast({
      title: t('failed'),
      description: error instanceof Error ? error.message : t('retry'),
      variant: 'destructive',
    });
  };
  const submit = async (values: SetupValues): Promise<void> => {
    if (needsLink && !values.name) {
      form.setError('name', { message: t('name') });
      return;
    }
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
        const result = await addIntegration({
          variables: {
            kind: 'telegram-messenger',
            name: values.name,
            brandId: values.brandId,
            channelId: channelId ?? '',
            data: { sourceBotId: current._id },
          },
        });
        if (!result.data) throw new Error(t('failed'));
        current = {
          ...current,
          erxesApiId: result.data.integrationsCreateExternalIntegration._id,
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
      setProgress(undefined);
      toast({ title: t('success') });
    } catch (error: unknown) {
      reportError(error);
    } finally {
      await refresh().catch(reportError);
      setBusy(false);
    }
  };
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
  const disconnectBot = async (): Promise<void> => {
    if (!bot) return;
    try {
      await confirm({ message: t('disconnectPrompt') });
    } catch {
      return;
    }
    setBusy(true);
    try {
      await disconnect({ variables: { _id: bot._id } });
      await refresh();
      toast({ title: t('disconnected') });
    } catch (error: unknown) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="flex flex-col flex-auto overflow-hidden"
      >
        <Sheet.Header>
          <Sheet.Title>
            {integrationId ? t('configure') : t('connect')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-auto p-4 space-y-5 styled-scroll">
          {botsQuery.loading && !botsQuery.data ? (
            <div className="flex gap-2">
              <Spinner />
              {t('loading')}
            </div>
          ) : botsQuery.error ? (
            <div role="alert">
              {t('loadError')}
              <Button
                type="button"
                variant="ghost"
                onClick={() => void botsQuery.refetch().catch(reportError)}
              >
                {t('retry')}
              </Button>
            </div>
          ) : integrationId && !bot ? (
            <p role="alert">{t('missing')}</p>
          ) : (
            <>
              {!integrationId && !savedBot && (
                <Form.Field
                  control={form.control}
                  name="botId"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('bot')}</Form.Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Form.Control>
                          <Select.Trigger>
                            <Select.Value />
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          <Select.Item value="new">{t('newBot')}</Select.Item>
                          {botsQuery.data?.telegramBots
                            .filter((item) => !item.erxesApiId)
                            .map((item) => (
                              <Select.Item key={item._id} value={item._id}>
                                {item.botName}{' '}
                                {item.botUsername
                                  ? `(@${item.botUsername})`
                                  : ''}
                              </Select.Item>
                            ))}
                        </Select.Content>
                      </Select>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}
              {bot && (
                <p className="font-medium">
                  {bot.botName} {bot.botUsername ? `(@${bot.botUsername})` : ''}
                </p>
              )}
              <Form.Field
                control={form.control}
                name="token"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {bot ? t('replacementToken') : t('token')}
                    </Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        type="password"
                        autoComplete="new-password"
                      />
                    </Form.Control>
                    <Form.Description>{t('tokenHint')}</Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              {needsLink && (
                <>
                  <Form.Field
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('name')}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
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
                </>
              )}
              {progress && (
                <p role="status" className="text-sm text-muted-foreground">
                  {t(progress)}
                </p>
              )}
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
                      <span className="block mt-1">
                        {t('callbackAutomatic')}
                      </span>
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
                        <span className="block mt-1">
                          {t('callbackPending')}
                        </span>
                      )}
                    </Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              {bot?.erxesApiId && (
                <div className="rounded-md border p-3 space-y-2 text-sm">
                  <p className="font-medium">{t('status')}</p>
                  {statusQuery.loading ? (
                    <Spinner />
                  ) : statusQuery.error ? (
                    <p role="alert">{t('statusFailed')}</p>
                  ) : (
                    status && (
                      <>
                        <p>
                          {status.url ? t('registered') : t('unregistered')}
                        </p>
                        <p className="break-all text-muted-foreground">
                          {status.url}
                        </p>
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
                          ].some(
                            (type) => !status.allowedUpdates?.includes(type),
                          ) && (
                            <p className="text-warning">
                              {t('channelUpdates')}
                            </p>
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
                    )
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => void refreshStatus()}
                    >
                      {t('refresh')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy || !status?.url}
                      onClick={() => void disconnectBot()}
                    >
                      {t('disconnect')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
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
        </Sheet.Content>
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
              botsQuery.loading ||
              Boolean(botsQuery.error) ||
              Boolean(integrationId && !bot)
            }
          >
            {busy && <Spinner size="sm" />}
            {integrationId ? t('save') : t('connect')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
