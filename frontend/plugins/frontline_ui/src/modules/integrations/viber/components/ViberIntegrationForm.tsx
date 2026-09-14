import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Sheet, Spinner, toast } from 'erxes-ui';
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
  type ViberIntegrationValues,
} from '../validation';
import { useState } from 'react';

export const ViberIntegrationForm = ({
  channelId,
  integration,
  onClose,
  canEdit,
}: {
  channelId: string;
  integration?: ViberIntegration;
  onClose: () => void;
  canEdit: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const client = useApolloClient();
  const [saving, setSaving] = useState(false);
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

  const onSubmit = async (values: ViberIntegrationValues): Promise<void> => {
    if (saving || !canEdit) return;
    setSaving(true);
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
          : 'Viber webhook registered',
      });
      onClose();
    } catch (error) {
      // Do not print tokens or provider responses. Server Viber errors are sanitized.
      const message =
        error instanceof Error ? error.message : 'Viber setup failed';
      setFailure(
        `${message} If a connection appears in the list, use Repair instead of adding it again.`,
      );
    } finally {
      // Registration can fail after persistence. Keep that repairable record visible.
      try {
        await client.refetchQueries({ include: VIBER_INTEGRATION_REFETCH });
      } catch {
        toast({
          title: 'Could not refresh Viber connections',
          description:
            'Use Refresh to check the saved result before repeating this action.',
          variant: 'destructive',
        });
      }
      setSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-auto overflow-hidden"
      >
        <Sheet.Header>
          <Sheet.Title>
            {t(integration ? 'viber-manage' : 'viber-connect', {
              defaultValue: integration ? 'Manage Viber' : 'Connect Viber',
            })}
          </Sheet.Title>
          <Sheet.Close disabled={saving} />
        </Sheet.Header>
        <Sheet.Content className="overflow-auto p-4 space-y-5">
          <p className="text-sm text-muted-foreground">
            Use a Viber bot token, not a personal Viber account or an ngrok
            authtoken. This connects one bot to this channel. Do not connect a
            bot already used by another platform: Viber has one webhook per bot.
          </p>
          {integration && (
            <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
              {connection.loading ? (
                <Spinner size="sm" />
              ) : connection.error ? (
                <p role="alert">{connection.error.message}</p>
              ) : connection.data?.viberConnection ? (
                <>
                  <p>
                    {connection.data.viberConnection.name} · Bot ID:{' '}
                    {connection.data.viberConnection.botId}
                  </p>
                  <p>
                    Registration:{' '}
                    {connection.data.viberConnection.healthStatus === 'healthy'
                      ? 'Webhook registered (not a live delivery test)'
                      : connection.data.viberConnection.healthStatus}
                  </p>
                  {connection.data.viberConnection.error && (
                    <p role="alert" className="text-destructive">
                      {connection.data.viberConnection.error}
                    </p>
                  )}
                  <p className="break-all">
                    Webhook:{' '}
                    {connection.data.viberConnection.webhookUrl ||
                      'Not configured'}
                  </p>
                </>
              ) : (
                <p role="alert">
                  The saved bot connection is missing. Ask an administrator to
                  inspect this integration before reconnecting.
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
                    {integration
                      ? 'Replacement bot token (optional)'
                      : 'Bot token'}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="new-password"
                      spellCheck={false}
                      disabled={saving}
                    />
                  </Form.Control>
                  <Form.Description>
                    {integration
                      ? 'Leave blank to keep the saved token. A replacement must belong to the same bot; it re-registers the webhook.'
                      : 'The token is sent to the backend and never returned by the settings API. Whitespace is rejected, not removed.'}
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
            {t('cancel', { defaultValue: 'Close' })}
          </Button>
          {canEdit && (
            <Button type="submit" disabled={saving}>
              {saving && <Spinner size="sm" />}
              {integration ? 'Save changes' : 'Connect Viber'}
            </Button>
          )}
        </Sheet.Footer>
      </form>
    </Form>
  );
};
