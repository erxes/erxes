import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Collapsible,
  Form,
  Skeleton,
  Spinner,
  Textarea,
  getPluginAssetsUrl,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck } from 'ui-modules';
import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { IntegrationType } from '@/types/Integration';
import {
  VIBER_MEDIA_SETTINGS,
  VIBER_UPDATE_MEDIA_SETTINGS,
  VIBER_SETUP,
} from '../graphql';
import {
  parseViberMediaHostnames,
  viberMediaSettingsSchema,
} from '../mediaSettings';
import type { ViberMediaSettings } from '../types';

export const ViberConfigUpdateCollapse = () => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const integration = INTEGRATIONS[IntegrationType.VIBER_MESSENGER];
  if (!isLoaded || !hasActionPermission('showIntegrations')) return null;

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        if (!busy) setOpen(next);
      }}
      className="w-full bg-muted rounded-lg"
    >
      <Collapsible.Trigger asChild>
        <Button
          variant="secondary"
          className="w-full h-auto flex justify-start group bg-transparent hover:bg-transparent gap-3 px-3 font-semibold"
        >
          <Collapsible.TriggerIcon className="text-accent-foreground" />
          <IntegrationLogo
            img={getPluginAssetsUrl('frontline', integration.img)}
            name={integration.name}
          />
          Viber
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="shadow-xs rounded-lg p-3 bg-background">
        {open && (
          <ViberConfigUpdate
            canEdit={hasActionPermission('integrationsEdit')}
            busy={busy}
            setBusy={setBusy}
          />
        )}
      </Collapsible.Content>
    </Collapsible>
  );
};

const ViberConfigUpdate = ({
  canEdit,
  busy,
  setBusy,
}: {
  canEdit: boolean;
  busy: boolean;
  setBusy: (value: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const query = useQuery<{ viberMediaSettings: ViberMediaSettings }>(
    VIBER_MEDIA_SETTINGS,
    { fetchPolicy: 'network-only' },
  );
  const settings = query.data?.viberMediaSettings;
  const form = useForm<{ hostnames: string }>({
    resolver: zodResolver(viberMediaSettingsSchema),
    defaultValues: { hostnames: '' },
  });
  const [updateSettings] = useMutation<
    { viberUpdateMediaSettings: ViberMediaSettings },
    { hostnames: string[] | null }
  >(VIBER_UPDATE_MEDIA_SETTINGS, {
    refetchQueries: [{ query: VIBER_SETUP }],
    awaitRefetchQueries: true,
    update(cache, result) {
      if (result.data)
        cache.writeQuery({
          query: VIBER_MEDIA_SETTINGS,
          data: { viberMediaSettings: result.data.viberUpdateMediaSettings },
        });
    },
  });

  useEffect(() => {
    if (settings) form.reset({ hostnames: settings.hostnames.join('\n') });
  }, [settings, form]);

  const save = async (hostnames: string[] | null): Promise<void> => {
    if (!canEdit || busy) return;
    setBusy(true);
    try {
      await confirm({
        message:
          hostnames === null
            ? t('viber-reset-media-hosts-confirm', {
                defaultValue:
                  'Restore the default media hosts for all Viber integrations in this workspace?',
              })
            : hostnames.length
            ? t('viber-save-media-hosts-confirm', {
                defaultValue:
                  'Allow Viber media downloads from these hosts? Only approve hosts confirmed by Viber or your administrator.',
              })
            : t('viber-clear-media-hosts-confirm', {
                defaultValue:
                  'Disable incoming media for all Viber integrations in this workspace? Text messages will still work.',
              }),
      });
    } catch {
      setBusy(false);
      return;
    }
    try {
      const result = await updateSettings({ variables: { hostnames } });
      if (!result.data) throw new Error('Unable to update Viber settings.');
      form.reset({
        hostnames: result.data.viberUpdateMediaSettings.hostnames.join('\n'),
      });
      toast({
        title: t('viber-media-settings-updated', {
          defaultValue: 'Viber settings updated',
        }),
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: t('viber-media-settings-update-failed', {
          defaultValue: 'Unable to update Viber settings',
        }),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  if (query.loading && !settings) return <Skeleton className="h-32" />;
  if (query.error || !settings)
    return (
      <div className="space-y-2">
        <p role="alert">
          {t('viber-media-settings-load-failed', {
            defaultValue: 'Unable to load Viber settings.',
          })}
        </p>
        <Button
          variant="secondary"
          disabled={query.loading}
          onClick={() => {
            void query.refetch().catch(() => undefined);
          }}
        >
          {t('retry', { defaultValue: 'Retry' })}
        </Button>
      </div>
    );

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(({ hostnames }) =>
          save(parseViberMediaHostnames(hostnames)),
        )}
        aria-busy={busy}
      >
        <p className="text-sm text-muted-foreground">
          {t('viber-media-settings-scope', {
            defaultValue:
              'Applies to incoming media for all Viber integrations in this workspace.',
          })}
        </p>
        <Form.Field
          control={form.control}
          name="hostnames"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('viber-allowed-media-hosts', {
                  defaultValue: 'Allowed media hosts',
                })}
              </Form.Label>
              <Form.Control>
                <Textarea
                  {...field}
                  rows={4}
                  maxLength={8192}
                  disabled={!canEdit || busy}
                  spellCheck={false}
                  autoCapitalize="none"
                  className="font-mono text-sm"
                />
              </Form.Control>
              <Form.Description>
                {t('viber-media-hosts-help', {
                  defaultValue:
                    'One verified hostname per line. No URLs, IP addresses, or wildcards. Leave empty to disable incoming media.',
                })}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <p className="text-xs text-muted-foreground">
          {settings.source === 'settings'
            ? t('viber-media-hosts-custom', {
                defaultValue: 'Using saved workspace settings.',
              })
            : settings.source === 'environment'
            ? t('viber-media-hosts-environment', {
                defaultValue: 'Using server-configured defaults.',
              })
            : t('viber-media-hosts-default', {
                defaultValue: 'Using Viber defaults.',
              })}
        </p>
        {canEdit ? (
          <div className="flex justify-end gap-2">
            {settings.source === 'settings' && (
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void save(null)}
              >
                {t('viber-use-defaults', { defaultValue: 'Use defaults' })}
              </Button>
            )}
            <Button type="submit" disabled={busy || !form.formState.isDirty}>
              {busy && <Spinner size="sm" />}
              {t('save', { defaultValue: 'Save' })}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('viber-media-hosts-permission', {
              defaultValue:
                'You need permission to edit integrations to change these settings.',
            })}
          </p>
        )}
      </form>
    </Form>
  );
};
