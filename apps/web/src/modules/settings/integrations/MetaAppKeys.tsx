import type { MetaAppSettings } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { Button, CopyText, Input, Label, Spinner, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntegrationsSaved } from './customMutation';
import { DangerSection } from './DangerSection';
import { FormSection } from './FormSection';

type Field = 'appId' | 'appSecret' | 'verifyToken';

const useMetaAppSaved = (onSaved?: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });

  return useIntegrationsSaved(t('save-failed', 'Could not save'), onSaved, orpc.meta.key());
};

const Address = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <div className="rounded-md border bg-muted px-3 py-2">
      <CopyText value={value} className="max-w-full text-left">
        <code className="font-mono text-xs break-all">{value}</code>
      </CopyText>
    </div>
  </div>
);

const Addresses = ({ app }: { app: MetaAppSettings }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });

  return (
    <FormSection
      title={t('section.addresses', 'Addresses for Meta')}
      description={t(
        'section.addresses-description',
        'Paste these into your app on developers.facebook.com.',
      )}
    >
      {app.webhookUrl && (
        <Address label={t('field.webhookUrl', 'Webhook callback address')} value={app.webhookUrl} />
      )}
      <Address label={t('field.callbackUrl', 'OAuth redirect address')} value={app.callbackUrl} />
    </FormSection>
  );
};

const AppForm = ({ app }: { app: MetaAppSettings }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });
  const { toast } = useToast();
  const id = useId();

  const [draft, setDraft] = useState({
    appId: app.appId ?? '',
    appSecret: '',
    verifyToken: app.verifyToken ?? '',
  });

  const save = useMutation(
    orpc.meta.saveApp.mutationOptions(
      useMetaAppSaved(() => {
        setDraft((current) => ({ ...current, appSecret: '' }));
        toast({ title: t('app-saved', 'Meta app saved') });
      }),
    ),
  );

  const incomplete = !draft.appId || !draft.verifyToken || (!app.own && !draft.appSecret);

  const field = (key: Field, label: string, placeholder = '', type = 'text') => (
    <div className="space-y-1.5">
      <Label htmlFor={`${id}-${key}`}>{t(`field.${key}`, label)}</Label>
      <Input
        id={`${id}-${key}`}
        type={type}
        value={draft[key]}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
        onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
      />
    </div>
  );

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        if (!incomplete) save.mutate({ ...draft, appSecret: draft.appSecret || undefined });
      }}
    >
      {field('appId', 'App id', '1234567890')}
      {field('appSecret', 'App secret', app.own ? t('secret-saved', 'Saved') : '', 'password')}
      {field('verifyToken', 'Verify token')}
      <p className="text-xs text-muted-foreground">
        {app.own
          ? t('secret-kept', 'Leave the app secret empty to keep the saved one.')
          : t(
              'verify-hint',
              'Pick any verify token and enter the same one in Meta’s webhook setup.',
            )}
      </p>
      <div className="flex justify-end">
        <Button type="submit" disabled={incomplete || save.isPending}>
          {save.isPending ? <Spinner size="sm" /> : t('save', 'Save app')}
        </Button>
      </div>
    </form>
  );
};

const RemoveApp = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });
  const remove = useMutation(orpc.meta.removeApp.mutationOptions(useMetaAppSaved()));

  return (
    <DangerSection
      title={t('remove-title', 'Remove your Meta app')}
      description={t(
        'remove-description',
        'New connections go through the install’s app. Pages connected through yours stop working.',
      )}
      confirmMessage={t('remove-confirm', 'Remove your Meta app?')}
      confirmDescription={t(
        'remove-description',
        'New connections go through the install’s app. Pages connected through yours stop working.',
      )}
      label={t('remove', 'Remove')}
      pending={remove.isPending}
      onConfirm={() => remove.mutate({})}
    />
  );
};

export const MetaAppKeys = ({ app }: { app: MetaAppSettings }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.meta' });

  return (
    <div className="space-y-6">
      {app.installApp && !app.own && (
        <p className="rounded-lg border p-4 text-sm">
          {t(
            'install-app',
            'Pages connect through this install’s Meta app until you save your own.',
          )}
        </p>
      )}
      <FormSection
        title={t('section.app', 'Your Meta app')}
        description={t(
          'section.app-description',
          'From your app’s settings on developers.facebook.com. The secret is never shown again.',
        )}
      >
        <AppForm key={`${app.appId ?? ''}:${app.verifyToken ?? ''}`} app={app} />
      </FormSection>
      <Addresses app={app} />
      {app.own && <RemoveApp />}
    </div>
  );
};
