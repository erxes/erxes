import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Badge,
  Button,
  CopyText,
  Form,
  Input,
  Sheet,
  Spinner,
  toast,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBrand } from 'ui-modules';
import { ADD_INTEGRATION } from '@/integrations/graphql/mutations/AddIntegration';
import { EDIT_INTEGRATION } from '@/integrations/graphql/mutations/EditIntegration';
import {
  VIBER_CONNECTION,
  VIBER_INTEGRATION_REFETCH,
  VIBER_UPDATE_TOKEN,
} from '../graphql';
import type { ViberConnection, ViberIntegration } from '../types';
import {
  viberIntegrationSchema,
  getViberConnectionStatus,
  type ViberIntegrationValues,
} from '../validation';
import { useEffect, useState } from 'react';
import { IconCopy } from '@tabler/icons-react';
import { SecretInput } from '@/integrations/components/SecretInput';

export const ViberIntegrationForm = ({
  channelId,
  integration,
  onClose,
  canEdit,
  saving,
  onSavingChange,
}: {
  channelId: string;
  integration?: ViberIntegration;
  onClose: () => void;
  canEdit: boolean;
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
  const client = useApolloClient();
  const [failure, setFailure] = useState<string>();
  const [create] = useMutation(ADD_INTEGRATION);
  const [edit] = useMutation(EDIT_INTEGRATION);
  const [updateToken] = useMutation(VIBER_UPDATE_TOKEN);
  const connection = useQuery<{ viberConnection: ViberConnection | null }>(
    VIBER_CONNECTION,
    {
      variables: { integrationId: integration?._id },
      skip: !integration,
      fetchPolicy: 'network-only',
    },
  );
  const form = useForm<ViberIntegrationValues>({
    resolver: zodResolver(viberIntegrationSchema(Boolean(integration))),
    defaultValues: {
      name: integration?.name || '',
      brandId: integration?.brandId || '',
      token: '',
    },
  });
  useEffect(() => {
    if (canEdit) form.setFocus('name');
  }, [canEdit, form]);
  const bot = connection.data?.viberConnection;
  const webhookStatus = getViberConnectionStatus({ status: bot?.healthStatus });

  const onSubmit = async (values: ViberIntegrationValues): Promise<void> => {
    if (saving || !canEdit) return;
    onSavingChange(true);
    setFailure(undefined);
    try {
      if (integration) {
        await edit({
          variables: {
            _id: integration._id,
            name: values.name,
            brandId: values.brandId,
            channelId,
          },
        });
        if (values.token)
          await updateToken({
            variables: { integrationId: integration._id, token: values.token },
          });
      } else {
        await create({
          variables: {
            name: values.name,
            brandId: values.brandId,
            channelId,
            kind: 'viber-messenger',
            data: { token: values.token },
          },
        });
      }
      form.resetField('token');
      toast({
        title: integration
          ? 'Viber integration updated'
          : 'Viber integration added',
      });
      onClose();
    } catch (error) {
      // Do not print tokens or provider responses. Server Viber errors are sanitized.
      const message =
        error instanceof Error ? error.message : 'Viber setup failed';
      setFailure(message);
    } finally {
      // Registration can fail after persistence. Keep that repairable record visible.
      try {
        await client.refetchQueries({ include: VIBER_INTEGRATION_REFETCH });
      } catch {
        toast({
          title: 'Unable to refresh integrations',
          description: 'Refresh the list before trying again.',
          variant: 'destructive',
        });
      }
      onSavingChange(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-auto overflow-hidden"
        aria-busy={saving}
      >
        <Sheet.Header>
          <Sheet.Title className="min-w-0 truncate pr-3">
            {integration?.name ||
              t('viber-add', { defaultValue: 'Add Viber integration' })}
          </Sheet.Title>
          <Sheet.Description className="sr-only">
            Viber integration settings
          </Sheet.Description>
          <Sheet.Close disabled={saving} />
        </Sheet.Header>
        <Sheet.Content className="overflow-auto p-5 space-y-5">
          {integration && (
            <div className="border-b pb-5 text-sm">
              {connection.loading ? (
                <Spinner size="sm" />
              ) : connection.error ? (
                <p role="alert">{connection.error.message}</p>
              ) : bot ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium break-words">
                      {bot.name || 'Viber bot'}
                    </span>
                    <Badge variant={webhookStatus.variant}>
                      Webhook: {webhookStatus.label.toLowerCase()}
                    </Badge>
                  </div>
                  <dl className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2 text-xs">
                    <dt className="text-muted-foreground">Bot ID</dt>
                    <dd className="break-all font-mono">{bot.botId}</dd>
                    <dt className="text-muted-foreground">Webhook URL</dt>
                    <dd className="min-w-0">
                      {bot.webhookUrl ? (
                        <CopyText
                          value={bot.webhookUrl}
                          className="w-full min-w-0 justify-between gap-2 rounded-sm font-mono hover:text-primary"
                        >
                          <span className="truncate">{bot.webhookUrl}</span>
                          <IconCopy
                            className="size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Copy webhook URL</span>
                        </CopyText>
                      ) : (
                        'Not configured'
                      )}
                    </dd>
                  </dl>
                  {bot.error && (
                    <p role="alert" className="text-destructive">
                      {bot.error}
                    </p>
                  )}
                </div>
              ) : (
                <p role="alert">
                  Bot connection not found. Contact your administrator.
                </p>
              )}
            </div>
          )}
          {failure && (
            <p role="alert" className="text-sm text-destructive">
              {failure}
            </p>
          )}
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('name', { defaultValue: 'Name' })}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    disabled={!canEdit || saving}
                    autoComplete="off"
                    placeholder="e.g. Customer support"
                    maxLength={100}
                  />
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
                <Form.Label>{t('brand', { defaultValue: 'Brand' })}</Form.Label>
                <Form.Control>
                  <SelectBrand
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!canEdit || saving}
                    className="w-full"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          {canEdit && (
            <Form.Field
              control={form.control}
              name="token"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {integration ? 'New bot token (optional)' : 'Bot token'}
                  </Form.Label>
                  <Form.Control>
                    <SecretInput
                      {...field}
                      autoComplete="new-password"
                      spellCheck={false}
                      disabled={saving}
                      placeholder={
                        integration
                          ? 'Leave blank to keep current token'
                          : 'Enter bot token'
                      }
                    />
                  </Form.Control>
                  <Form.Description>
                    {integration
                      ? 'Leave blank to keep the current token. A new token must belong to the same bot.'
                      : 'Paste the token from your Viber bot settings. Connecting replaces the bot’s current webhook.'}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          )}
        </Sheet.Content>
        <Sheet.Footer>
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={onClose}
          >
            {t('close', { defaultValue: 'Close' })}
          </Button>
          {canEdit && (
            <Button type="submit" disabled={saving}>
              {saving && <Spinner size="sm" />}
              {saving
                ? integration
                  ? 'Saving…'
                  : 'Connecting…'
                : integration
                ? t('save', { defaultValue: 'Save' })
                : 'Connect'}
            </Button>
          )}
        </Sheet.Footer>
      </form>
    </Form>
  );
};
