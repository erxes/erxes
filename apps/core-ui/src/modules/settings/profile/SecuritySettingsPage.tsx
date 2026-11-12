import { IconCircleCheck, IconCircleX, IconKey, IconLock } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Form,
  Input,
  PageContainer,
  RelativeDateDisplay,
  ScrollArea,
  Spinner,
  useToast,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'erxes-ui';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, isApiError, messageOf } from '~/lib/api';
import { useSignOut } from '~/modules/auth/session';
import { Section } from './Section';
import { TwoFactorSection } from './TwoFactorSection';

interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirm: string;
}

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,200}$/;

/** Changing my own password needs the current one. */
const PasswordForm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { toast } = useToast();

  const form = useForm<PasswordValues>({
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });

  const change = useMutation({
    mutationFn: (values: PasswordValues) =>
      api.auth.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      form.reset();
      toast({ title: t('password-changed', 'Password changed') });
    },
    onError: (error) => {
      if (isApiError(error, 'WRONG_PASSWORD'))
        form.setError('currentPassword', { message: error.message });
      else if (isApiError(error, 'SAME_PASSWORD'))
        form.setError('newPassword', { message: error.message });
      else
        toast({
          variant: 'destructive',
          title: t('password-failed', 'Could not change the password'),
          description: messageOf(error),
        });
    },
  });

  const field = (name: keyof PasswordValues, label: string, autoComplete: string) => (
    <Form.Field
      name={name}
      rules={
        name === 'currentPassword'
          ? { required: t('required', 'Required') }
          : name === 'newPassword'
            ? {
                pattern: {
                  value: PASSWORD_RULE,
                  message: t(
                    'password-rule',
                    'At least 8 characters with a lower-case letter, an upper-case letter and a digit',
                  ),
                },
              }
            : {
                validate: (value: string) =>
                  value === form.getValues('newPassword') ||
                  t('password-mismatch', 'The passwords differ'),
              }
      }
      render={({ field: input }) => (
        <Form.Item>
          <Form.Label className="text-xs">{label}</Form.Label>
          <Form.Control>
            <Input {...input} type="password" autoComplete={autoComplete} />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );

  return (
    <Section
      title={t('password', 'Password')}
      description={t('password-description', 'Use a password you don’t use elsewhere.')}
    >
      <Form {...form}>
        <form
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          onSubmit={form.handleSubmit((values) => change.mutate(values))}
        >
          {field('currentPassword', t('current-password', 'Current password'), 'current-password')}
          {field('newPassword', t('new-password', 'New password'), 'new-password')}
          {field('confirm', t('confirm-password', 'Repeat new password'), 'new-password')}
          <div className="sm:col-span-3">
            <Button type="submit" variant="outline" disabled={change.isPending}>
              {change.isPending ? <Spinner size="sm" /> : <IconKey />}
              {t('change-password', 'Change password')}
            </Button>
          </div>
        </form>
      </Form>
    </Section>
  );
};

/** "Chrome on macOS" from a user agent, enough to recognise a device. */
const deviceOf = (agent: string | null) => {
  if (!agent) return '—';

  const browser = /Edg\//.test(agent)
    ? 'Edge'
    : /Chrome\//.test(agent)
      ? 'Chrome'
      : /Firefox\//.test(agent)
        ? 'Firefox'
        : /Safari\//.test(agent)
          ? 'Safari'
          : agent.split(' ')[0];

  const system = /Mac OS X/.test(agent)
    ? 'macOS'
    : /Windows/.test(agent)
      ? 'Windows'
      : /Android/.test(agent)
        ? 'Android'
        : /iPhone|iPad/.test(agent)
          ? 'iOS'
          : /Linux/.test(agent)
            ? 'Linux'
            : '';

  return system ? `${browser} · ${system}` : browser;
};

/** Where and when I signed in; a failed attempt I don't recognise is worth a password change. */
const SignIns = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  const { data, isPending } = useQuery({
    queryKey: ['auth', 'sign-ins'],
    queryFn: () => api.auth.signIns(),
  });

  return (
    <Section
      title={t('sign-ins', 'Recent sign-ins')}
      description={t('sign-ins-description', 'If you don’t recognise one, change your password.')}
    >
      {isPending ? (
        <Spinner containerClassName="py-6" />
      ) : !data?.data.length ? (
        <p className="text-sm text-muted-foreground">
          {t('no-sign-ins', 'No sign-ins recorded yet.')}
        </p>
      ) : (
        <ul className="divide-y text-sm">
          {data.data.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 py-2">
              {entry.success ? (
                <IconCircleCheck className="size-4 text-green-600" />
              ) : (
                <IconCircleX className="size-4 text-destructive" />
              )}
              <span className="flex-1">{deviceOf(entry.userAgent)}</span>
              <span className="text-muted-foreground">{entry.ip ?? '—'}</span>
              {!entry.success && (
                <Badge variant="destructive" className="font-normal">
                  {t('failed', 'Failed')}
                </Badge>
              )}
              <RelativeDateDisplay value={entry.createdAt} asChild>
                <span className="w-28 text-right text-muted-foreground">
                  <RelativeDateDisplay.Value value={entry.createdAt} />
                </span>
              </RelativeDateDisplay>
            </li>
          ))}
        </ul>
      )}
      <SignOutEverywhere />
    </Section>
  );
};

/** Ends every session on every device, this one too (a lost laptop, a shared computer). */
const SignOutEverywhere = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });
  const { toast } = useToast();
  const signOut = useSignOut();

  const run = useMutation({
    mutationFn: () => signOut({ everywhere: true }),
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('sign-out-everywhere-failed', 'Could not sign out'),
        description: messageOf(error),
      }),
  });

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-md border p-3">
      <p className="text-sm text-muted-foreground">
        {t(
          'sign-out-everywhere-description',
          'Lost a device or signed in on a shared computer? End every session, this one included.',
        )}
      </p>
      <Button variant="outline" disabled={run.isPending} onClick={() => run.mutate()}>
        {t('sign-out-everywhere', 'Sign out of all devices')}
      </Button>
    </div>
  );
};

/** Settings › Password & security: the member's password, two-step sign-in and where they are signed in. */
export const SecuritySettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('security-title', 'Password & security'),
                to: '/settings/security',
                icon: IconLock,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
          <PasswordForm />
          <section className="rounded-lg border bg-background p-5">
            <TwoFactorSection />
          </section>
          <SignIns />
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
