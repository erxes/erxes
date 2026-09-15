import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CellContext } from '@tanstack/react-table';
import { IconCopy, IconEdit, IconKey, IconTool } from '@tabler/icons-react';
import {
  Button,
  CopyText,
  Dialog,
  Form,
  Separator,
  Spinner,
  TextOverflowTooltip,
  toast,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { IIntegrationDetail } from '@/integrations/types/Integration';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { SecretInput } from '@/integrations/components/SecretInput';
import {
  VIBER_CONNECTION,
  VIBER_INTEGRATION_REFETCH,
  VIBER_REPAIR,
  VIBER_UPDATE_TOKEN,
} from '../graphql';
import {
  viberIntegrationSchema,
  createViberTokenSchema,
  type ViberIntegrationValues,
} from '../validation';
import { getSavedViberIntegrationId } from '../setupError';
import type { ViberConnection } from '../types';
import { ViberIntegrationFields } from './ViberIntegrationForm';

type ActionProps = { cell: CellContext<IIntegrationDetail, unknown> };
type FormProps = {
  id: string;
  onClose: () => void;
  onSavingChange: (saving: boolean) => void;
};

const ViberConnectionDetails = ({ id }: { id: string }) => {
  const { t } = useTranslation('frontline');
  const { data, loading, error } = useQuery<{
    viberConnection: ViberConnection | null;
  }>(VIBER_CONNECTION, {
    variables: { integrationId: id },
    fetchPolicy: 'network-only',
  });
  if (loading) return <Spinner size="sm" />;
  if (error)
    return (
      <p role="alert" className="text-sm text-destructive">
        {error.message}
      </p>
    );
  const bot = data?.viberConnection;
  if (!bot)
    return (
      <p role="alert">
        {t('viber-connection-missing', {
          defaultValue:
            'Bot connection not found. Delete this integration and connect again.',
        })}
      </p>
    );
  return (
    <div className="space-y-2 text-sm">
      <TextOverflowTooltip
        value={bot.name || 'Viber'}
        className="block font-medium"
      />
      {bot.webhookUrl && (
        <CopyText
          value={bot.webhookUrl}
          className="w-full min-w-0 justify-between gap-2 rounded-sm text-muted-foreground hover:text-primary"
        >
          <TextOverflowTooltip
            value={bot.webhookUrl}
            className="min-w-0 text-left"
          />
          <IconCopy className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="sr-only">
            {t('copy-webhook-url', { defaultValue: 'Copy webhook URL' })}
          </span>
        </CopyText>
      )}
      {bot.error && (
        <p role="alert" className="text-destructive">
          {bot.error}
        </p>
      )}
    </div>
  );
};

const ViberIntegrationEditForm = ({
  id,
  onClose,
  onSavingChange,
}: FormProps) => {
  const { t } = useTranslation('frontline');
  const { integrationDetail, loading } = useIntegrationDetail({
    integrationId: id,
  });
  const { editIntegration, loading: saving } = useIntegrationEdit();
  const form = useForm<ViberIntegrationValues>({
    resolver: zodResolver(viberIntegrationSchema(true, t)),
    defaultValues: { name: '', brandId: '', token: '' },
  });
  useEffect(() => {
    if (integrationDetail)
      form.reset({
        name: integrationDetail.name,
        brandId: integrationDetail.brandId ?? '',
        token: '',
      });
  }, [form, integrationDetail]);
  const onSubmit = async (values: ViberIntegrationValues): Promise<void> => {
    if (saving || !integrationDetail) return;
    onSavingChange(true);
    try {
      await editIntegration({
        variables: {
          _id: id,
          name: values.name,
          brandId: values.brandId,
          channelId: integrationDetail.channelId,
        },
      });
      toast({ title: t('integration-updated') });
      onClose();
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : t('failed-to-update-integration', {
                defaultValue: 'Unable to update integration',
              }),
        variant: 'destructive',
      });
    } finally {
      onSavingChange(false);
    }
  };
  if (loading) return <Spinner className="p-20" />;
  if (!integrationDetail)
    return (
      <p role="alert" className="p-6">
        {t('integration-not-found', { defaultValue: 'Integration not found' })}
      </p>
    );
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="p-6 pb-8 space-y-6">
          <ViberConnectionDetails id={id} />
          <ViberIntegrationFields control={form.control} disabled={saving} />
        </div>
        <Separator />
        <Dialog.Footer className="py-4 px-6">
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={onClose}
          >
            {t('close')}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Spinner size="sm" />}
            {t('save')}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};

const ViberTokenForm = ({ id, onClose, onSavingChange }: FormProps) => {
  const { t } = useTranslation('frontline');
  const client = useApolloClient();
  const [updateToken, { loading }] = useMutation(VIBER_UPDATE_TOKEN);
  const [failure, setFailure] = useState<string>();
  const form = useForm<{ token: string }>({
    resolver: zodResolver(z.object({ token: createViberTokenSchema(t) })),
    defaultValues: { token: '' },
  });
  const onSubmit = async ({ token }: { token: string }): Promise<void> => {
    if (loading) return;
    onSavingChange(true);
    setFailure(undefined);
    try {
      await updateToken({ variables: { integrationId: id, token } });
      form.reset();
      toast({ title: t('integration-updated') });
      onClose();
    } catch (error) {
      if (getSavedViberIntegrationId(error)) {
        form.reset();
        toast({
          title: t('viber-token-updated', {
            defaultValue: 'Bot token updated',
          }),
          description: t('viber-setup-incomplete', {
            defaultValue:
              'Use Repair on the integration to finish connecting the bot.',
          }),
        });
        onClose();
      } else {
        setFailure(
          error instanceof Error
            ? error.message
            : t('viber-token-update-failed', {
                defaultValue: 'Unable to update bot token',
              }),
        );
      }
    } finally {
      try {
        await client.refetchQueries({ include: VIBER_INTEGRATION_REFETCH });
      } catch {
        toast({
          title: t('integrations-refresh-failed', {
            defaultValue: 'Unable to refresh integrations. Please try again.',
          }),
          variant: 'destructive',
        });
      }
      onSavingChange(false);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="p-6 pb-8 space-y-6">
          {failure && (
            <p role="alert" className="text-sm text-destructive">
              {failure}
            </p>
          )}
          <Form.Field
            control={form.control}
            name="token"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('bot-token', { defaultValue: 'Bot token' })}
                </Form.Label>
                <Form.Control>
                  <SecretInput
                    {...field}
                    autoComplete="new-password"
                    spellCheck={false}
                    disabled={loading}
                  />
                </Form.Control>
                <Form.Description>
                  {t('viber-token-change-help', {
                    defaultValue:
                      'The new token must belong to the same Viber bot.',
                  })}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <Separator />
        <Dialog.Footer className="py-4 px-6">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={onClose}
          >
            {t('close')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Spinner size="sm" />}
            {t('save')}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};

const ViberIntegrationDialog = ({
  cell,
  token = false,
}: ActionProps & { token?: boolean }) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const label = token
    ? t('viber-change-token', { defaultValue: 'Change bot token' })
    : t('edit');
  const Content = token ? ViberTokenForm : ViberIntegrationEditForm;
  return (
    <Dialog open={open} onOpenChange={(value) => !saving && setOpen(value)}>
      <Dialog.Trigger asChild>
        <div className="flex items-center gap-2 w-full">
          {token ? <IconKey size={16} /> : <IconEdit size={16} />}
          {label}
        </div>
      </Dialog.Trigger>
      <Dialog.Content
        className="p-0 gap-0 border-0 shadow-lg"
        onEscapeKeyDown={(event) => saving && event.preventDefault()}
        onInteractOutside={(event) => saving && event.preventDefault()}
      >
        <Dialog.Header className="px-4 py-3">
          <Dialog.Title className="min-w-0 pr-6">
            <TextOverflowTooltip
              value={token ? label : cell.row.original.name}
              className="block"
            />
          </Dialog.Title>
          <Dialog.Description className="sr-only">{label}</Dialog.Description>
        </Dialog.Header>
        <Separator />
        <Content
          id={cell.row.original._id}
          onClose={() => setOpen(false)}
          onSavingChange={setSaving}
        />
      </Dialog.Content>
    </Dialog>
  );
};

export const ViberIntegrationActions = (props: ActionProps) => (
  <ViberIntegrationDialog {...props} />
);
export const ViberIntegrationToken = (props: ActionProps) => (
  <ViberIntegrationDialog {...props} token />
);

export const ViberIntegrationRepair = ({ cell }: ActionProps) => {
  const { t } = useTranslation('frontline');
  const [repair, { loading }] = useMutation(VIBER_REPAIR, {
    refetchQueries: VIBER_INTEGRATION_REFETCH,
    onCompleted: () =>
      toast({
        title: t('repaired-successfully', {
          defaultValue: 'Repaired successfully',
        }),
      }),
    onError: (error) => toast({ title: error.message, variant: 'destructive' }),
  });
  const handleRepair = (): void => {
    if (!loading)
      void repair({
        variables: { integrationId: cell.row.original._id },
      }).catch(() => undefined);
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleRepair}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleRepair();
        }
      }}
      className="flex items-center gap-2 w-full"
      aria-disabled={loading}
    >
      {loading ? (
        <Spinner className="size-4 text-primary" />
      ) : (
        <IconTool size={16} />
      )}
      {t('repair', { defaultValue: 'Repair' })}
    </div>
  );
};
